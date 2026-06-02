import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderQueryDto, AddPaymentDto } from './dto';
import { getPaginationParams, createPaginatedResult, generateOrderNumber } from '../../common/utils';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { CargoService } from '../cargo/cargo.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);

    constructor(
        private prisma: PrismaService,
        private cargoService: CargoService,
        private emailService: EmailService,
    ) { }

    /**
     * Siparişi kargoya ver
     */
    async shipOrder(id: string, cargoProvider: string, cargoTrackingCode: string) {
        if (!cargoProvider || !cargoTrackingCode) {
            throw new BadRequestException('Kargo firması ve takip numarası zorunludur');
        }

        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                customer: true,
                items: { include: { variant: { include: { product: true } } } },
            },
        });

        if (!order) {
            throw new NotFoundException('Sipariş bulunamadı');
        }

        if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
            throw new BadRequestException('Sipariş zaten kargoya verilmiş');
        }

        // Update order status
        const updatedOrder = await this.prisma.order.update({
            where: { id },
            data: {
                status: OrderStatus.SHIPPED,
                cargoProvider: cargoProvider,
                cargoTrackingCode: cargoTrackingCode,
                shippedAt: new Date(),
                notes: order.notes ? `${order.notes}\n[${new Date().toLocaleString('tr-TR')}] Sipariş kargoya verildi: ${cargoProvider} - ${cargoTrackingCode}` : `[${new Date().toLocaleString('tr-TR')}] Sipariş kargoya verildi: ${cargoProvider} - ${cargoTrackingCode}`,
            },
        });

        // Send email
        if (order.customer?.email) {
            await this.emailService.sendShippingNotification(order.customer.email, {
                customerName: order.customer.firstName,
                orderNumber: order.orderNumber,
                carrier: cargoProvider,
                trackingNumber: cargoTrackingCode,
                trackingUrl: `https://www.google.com/search?q=${cargoProvider}+kargo+takip+${cargoTrackingCode}`
            });
        }

        return updatedOrder;
    }

    /**
     * Sipariş listesi
     */
    async findAll(query: OrderQueryDto) {
        const { page, limit, skip } = getPaginationParams(query);

        const where: any = {};

        // Arama
        if (query.search) {
            where.orderNumber = { contains: query.search, mode: 'insensitive' };
        }

        // Müşteri filtresi
        if (query.customerId) {
            where.customerId = query.customerId;
        }

        // Durum filtresi
        if (query.status) {
            where.status = query.status;
        }

        // Tarih aralığı
        if (query.startDate || query.endDate) {
            where.createdAt = {};
            if (query.startDate) {
                where.createdAt.gte = new Date(query.startDate);
            }
            if (query.endDate) {
                where.createdAt.lte = new Date(query.endDate + 'T23:59:59.999Z');
            }
        }

        // Sıralama
        const orderBy: any = {};
        if (query.sortBy) {
            orderBy[query.sortBy] = query.sortOrder || 'desc';
        } else {
            orderBy.createdAt = 'desc';
        }

        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    customer: {
                        select: { id: true, firstName: true, lastName: true, phone: true },
                    },
                    user: {
                        select: { id: true, firstName: true, lastName: true },
                    },
                    _count: {
                        select: { items: true, payments: true },
                    },
                },
            }),
            this.prisma.order.count({ where }),
        ]);

        return createPaginatedResult(orders, total, page, limit);
    }

    /**
     * Sipariş detayı
     */
    async findOne(id: string) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                customer: {
                    select: { id: true, firstName: true, lastName: true, phone: true, email: true },
                },
                user: {
                    select: { id: true, firstName: true, lastName: true },
                },
                items: {
                    include: {
                        variant: {
                            include: {
                                product: {
                                    select: { id: true, name: true, sku: true },
                                },
                            },
                        },
                    },
                },
                payments: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!order) {
            throw new NotFoundException('Sipariş bulunamadı');
        }

        return order;
    }

    /**
     * Yeni sipariş oluştur
     */
    async create(createOrderDto: CreateOrderDto, userId: string) {
        // Sipariş numarası oluştur
        const orderNumber = await this.generateUniqueOrderNumber();

        // Stok kontrolü ve toplam hesaplama
        let subtotal = 0;
        const orderItems: any[] = [];

        for (const item of createOrderDto.items) {
            const variant = await this.prisma.variant.findUnique({
                where: { id: item.variantId },
                include: { product: true },
            });

            if (!variant) {
                throw new BadRequestException(`Varyant bulunamadı: ${item.variantId}`);
            }

            if (variant.stock < item.quantity) {
                throw new BadRequestException(
                    `Yetersiz stok: ${variant.product.name} (${variant.size}/${variant.color}) - Mevcut: ${variant.stock}`,
                );
            }

            const itemTotal = item.unitPrice * item.quantity - (item.discount || 0);
            subtotal += itemTotal;

            orderItems.push({
                variantId: item.variantId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount: item.discount || 0,
                total: itemTotal,
            });
        }

        // İndirim uygula
        const discountAmount = createOrderDto.discountAmount || 0;
        const totalAmount = subtotal - discountAmount;

        // Sipariş oluştur
        const order = await this.prisma.order.create({
            data: {
                orderNumber,
                customerId: createOrderDto.customerId,
                userId,
                subtotal,
                discountAmount,
                totalAmount,
                notes: createOrderDto.notes,
                status: OrderStatus.PENDING,
                paymentStatus: PaymentStatus.PENDING,
                items: {
                    create: orderItems,
                },
            },
            include: {
                items: true,
                customer: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });

        // Stokları düşür
        for (const item of createOrderDto.items) {
            await this.prisma.variant.update({
                where: { id: item.variantId },
                data: { stock: { decrement: item.quantity } },
            });
        }

        this.logger.log(`Yeni sipariş oluşturuldu: ${order.orderNumber}`);

        return order;
    }

    /**
     * Sipariş durumu güncelle
     */
    async updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto, userId: string) {
        const order = await this.findOne(id);

        // Durum geçiş kontrolü
        if (order.status === OrderStatus.CANCELLED) {
            throw new BadRequestException('İptal edilmiş sipariş güncellenemez');
        }

        if (order.status === OrderStatus.DELIVERED && updateStatusDto.status !== OrderStatus.RETURNED) {
            throw new BadRequestException('Teslim edilmiş sipariş sadece iade edilebilir');
        }

        const updatedOrder = await this.prisma.order.update({
            where: { id },
            data: {
                status: updateStatusDto.status,
                notes: updateStatusDto.note
                    ? `${order.notes || ''}\n[${new Date().toLocaleString('tr-TR')}] ${updateStatusDto.note}`
                    : order.notes,
            },
        });

        this.logger.log(`Sipariş durumu güncellendi: ${order.orderNumber} -> ${updateStatusDto.status}`);

        return updatedOrder;
    }

    /**
     * Sipariş iptal et
     */
    async cancel(id: string, reason: string, userId: string) {
        const order = await this.findOne(id);

        if (order.status === OrderStatus.CANCELLED) {
            throw new BadRequestException('Sipariş zaten iptal edilmiş');
        }

        if (order.status === OrderStatus.DELIVERED) {
            throw new BadRequestException('Teslim edilmiş sipariş iptal edilemez. İade işlemi başlatın.');
        }

        // Stokları geri ekle
        for (const item of order.items) {
            await this.prisma.variant.update({
                where: { id: item.variantId },
                data: { stock: { increment: item.quantity } },
            });
        }

        // Siparişi iptal et
        const updatedOrder = await this.prisma.order.update({
            where: { id },
            data: {
                status: OrderStatus.CANCELLED,
                notes: `${order.notes || ''}\n[İPTAL - ${new Date().toLocaleString('tr-TR')}] ${reason}`,
            },
        });

        this.logger.log(`Sipariş iptal edildi: ${order.orderNumber}`);

        return updatedOrder;
    }

    /**
     * Siparişe ödeme ekle
     */
    async addPayment(orderId: string, paymentDto: AddPaymentDto, userId: string) {
        const order = await this.findOne(orderId);

        // Mevcut ödemelerin toplamını hesapla
        const totalPaid = order.payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const remaining = Number(order.totalAmount) - totalPaid;

        if (paymentDto.amount > remaining) {
            throw new BadRequestException(
                `Ödeme tutarı kalan borçtan fazla olamaz. Kalan: ${remaining.toFixed(2)} TL`,
            );
        }

        // Ödeme oluştur
        const payment = await this.prisma.payment.create({
            data: {
                orderId,
                method: paymentDto.method,
                amount: paymentDto.amount,
                status: PaymentStatus.COMPLETED,
                notes: paymentDto.note,
            },
        });

        // Ödeme durumunu kontrol et
        const newTotalPaid = totalPaid + paymentDto.amount;
        const paymentStatus = newTotalPaid >= Number(order.totalAmount)
            ? PaymentStatus.COMPLETED
            : PaymentStatus.PARTIAL;

        await this.prisma.order.update({
            where: { id: orderId },
            data: {
                paymentStatus,
                paidAmount: newTotalPaid,
            },
        });

        this.logger.log(`Ödeme eklendi: ${order.orderNumber} - ${paymentDto.amount} TL`);

        return payment;
    }

    /**
     * Benzersiz sipariş numarası oluştur
     */
    private async generateUniqueOrderNumber(): Promise<string> {
        let orderNumber: string;
        let exists = true;

        while (exists) {
            orderNumber = generateOrderNumber();
            const existing = await this.prisma.order.findUnique({
                where: { orderNumber },
            });
            exists = !!existing;
        }

        return orderNumber!;
    }
}
