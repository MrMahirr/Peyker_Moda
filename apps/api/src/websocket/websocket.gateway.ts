import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface AuthenticatedSocket extends Socket {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

@WebSocketGateway({
    cors: {
        origin: process.env.NODE_ENV === 'production'
            ? (process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : false)
            : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
        credentials: true,
    },
    namespace: '/ws',
})
export class WebsocketGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(WebsocketGateway.name);
    private connectedClients = new Map<string, AuthenticatedSocket>();

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    afterInit(server: Server) {
        this.logger.log('WebSocket Gateway başlatıldı');
    }

    async handleConnection(client: AuthenticatedSocket) {
        try {
            // Token doğrulama
            const token = client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.replace('Bearer ', '');

            if (token) {
                const payload = this.jwtService.verify(token, {
                    secret: this.configService.get<string>('JWT_SECRET'),
                });

                client.user = {
                    id: payload.sub,
                    email: payload.email,
                    role: payload.role,
                };

                // Kullanıcıya özel oda
                client.join(`user:${payload.sub}`);

                // Role bazlı oda
                client.join(`role:${payload.role}`);

                this.connectedClients.set(client.id, client);
                this.logger.log(`Bağlandı: ${client.user.email} (${client.id})`);
            } else {
                // Token yoksa anonim bağlantı (Sadece public eventler için)
                client.join('public');
                this.logger.log(`Anonim bağlantı: ${client.id}`);
            }
        } catch (error) {
            this.logger.warn(`Geçersiz token tespit edildi, bağlantı reddedildi: ${client.id}`);
            client.disconnect(true);
        }
    }

    handleDisconnect(client: AuthenticatedSocket) {
        this.connectedClients.delete(client.id);
        this.logger.log(`Bağlantı kesildi: ${client.id}`);
    }

    // ========== BROADCAST METHODS ==========

    /**
     * Stok güncelleme bildirimi
     */
    emitStockUpdate(data: {
        variantId: string;
        productName: string;
        size: string;
        color: string;
        oldStock: number;
        newStock: number;
    }) {
        this.server.to('role:ADMIN').to('role:MANAGER').to('role:STAFF').emit('stock:updated', {
            type: 'STOCK_UPDATE',
            timestamp: new Date().toISOString(),
            data,
        });
        this.logger.log(`Stok güncellemesi yayınlandı: ${data.productName}`);
    }

    /**
     * Kritik stok uyarısı
     */
    emitLowStockAlert(data: {
        variantId: string;
        productName: string;
        size: string;
        color: string;
        currentStock: number;
    }) {
        this.server.to('role:ADMIN').to('role:MANAGER').emit('stock:low', {
            type: 'LOW_STOCK_ALERT',
            timestamp: new Date().toISOString(),
            data,
        });
        this.logger.warn(`Kritik stok uyarısı: ${data.productName} (${data.currentStock} adet)`);
    }

    /**
     * Yeni sipariş bildirimi
     */
    emitNewOrder(data: {
        orderId: string;
        orderNumber: string;
        customerName: string;
        totalAmount: number;
        itemCount: number;
    }) {
        this.server.to('role:ADMIN').to('role:MANAGER').to('role:STAFF').emit('order:new', {
            type: 'NEW_ORDER',
            timestamp: new Date().toISOString(),
            data,
        });
        this.logger.log(`Yeni sipariş: ${data.orderNumber}`);
    }

    /**
     * Sipariş durumu değişikliği
     */
    emitOrderStatusChange(data: {
        orderId: string;
        orderNumber: string;
        oldStatus: string;
        newStatus: string;
    }) {
        this.server.to('role:ADMIN').to('role:MANAGER').to('role:STAFF').emit('order:status', {
            type: 'ORDER_STATUS_CHANGE',
            timestamp: new Date().toISOString(),
            data,
        });
    }

    /**
     * POS satış bildirimi
     */
    emitPosSale(data: {
        orderNumber: string;
        staffName: string;
        totalAmount: number;
        paymentMethod: string;
    }) {
        this.server.to('role:ADMIN').to('role:MANAGER').emit('pos:sale', {
            type: 'POS_SALE',
            timestamp: new Date().toISOString(),
            data,
        });
        this.logger.log(`POS Satış: ${data.orderNumber} - ${data.totalAmount} TL`);
    }

    /**
     * Genel bildirim
     */
    emitNotification(
        target: 'all' | 'admins' | 'managers' | 'staff' | string,
        notification: {
            title: string;
            message: string;
            type: 'info' | 'success' | 'warning' | 'error';
            link?: string;
        },
    ) {
        const payload = {
            type: 'NOTIFICATION',
            timestamp: new Date().toISOString(),
            data: notification,
        };

        switch (target) {
            case 'all':
                this.server.emit('notification:push', payload);
                break;
            case 'admins':
                this.server.to('role:ADMIN').emit('notification:push', payload);
                break;
            case 'managers':
                this.server.to('role:ADMIN').to('role:MANAGER').emit('notification:push', payload);
                break;
            case 'staff':
                this.server.to('role:ADMIN').to('role:MANAGER').to('role:STAFF').emit('notification:push', payload);
                break;
            default:
                // Belirli bir kullanıcıya
                this.server.to(`user:${target}`).emit('notification:push', payload);
        }
    }

    /**
     * Dashboard güncellemesi
     */
    emitDashboardUpdate(data: {
        type: 'sales' | 'orders' | 'customers' | 'inventory';
        payload: any;
    }) {
        this.server.to('role:ADMIN').to('role:MANAGER').emit('dashboard:update', {
            type: 'DASHBOARD_UPDATE',
            timestamp: new Date().toISOString(),
            data,
        });
    }

    // ========== CLIENT EVENTS ==========

    @SubscribeMessage('ping')
    handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
        return { event: 'pong', data: { timestamp: new Date().toISOString() } };
    }

    @SubscribeMessage('subscribe')
    handleSubscribe(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { room: string },
    ) {
        if (client.user) {
            client.join(data.room);
            this.logger.log(`${client.user.email} odaya katıldı: ${data.room}`);
            return { success: true, room: data.room };
        }
        return { success: false, error: 'Unauthorized' };
    }

    @SubscribeMessage('unsubscribe')
    handleUnsubscribe(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { room: string },
    ) {
        client.leave(data.room);
        return { success: true };
    }

    // ========== UTILITY METHODS ==========

    getConnectedClientsCount(): number {
        return this.connectedClients.size;
    }

    getConnectedUsers(): string[] {
        return Array.from(this.connectedClients.values())
            .filter((c) => c.user)
            .map((c) => c.user!.email);
    }
}
