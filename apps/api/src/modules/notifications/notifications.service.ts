import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WebsocketGateway } from '../../websocket/websocket.gateway';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        private prisma: PrismaService,
        private wsGateway: WebsocketGateway,
    ) { }

    async create(createNotificationDto: CreateNotificationDto) {
        const notification = await this.prisma.notification.create({
            data: createNotificationDto,
        });

        // Push real-time notification
        this.wsGateway.emitNotification(createNotificationDto.userId, {
            title: notification.title,
            message: notification.message,
            type: 'info',
            link: notification.link || undefined,
        });

        return notification;
    }

    async findAll(userId: string, isRead?: boolean) {
        return this.prisma.notification.findMany({
            where: {
                userId,
                ...(isRead !== undefined ? { isRead } : {}),
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 50,
        });
    }

    async markAsRead(id: string, userId: string) {
        return this.prisma.notification.update({
            where: { id, userId },
            data: { isRead: true },
        });
    }

    async markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }

    async remove(id: string, userId: string) {
        return this.prisma.notification.delete({
            where: { id, userId },
        });
    }

    async getUnreadCount(userId: string) {
        return this.prisma.notification.count({
            where: { userId, isRead: false },
        });
    }
}
