import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentProvider, PaymentInitializeParams, PaymentInitializeResult } from './providers/payment.provider.interface';
import { IyzicoPaymentProvider } from './providers/iyzico.payment.provider';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);
    private provider: PaymentProvider;

    constructor(private readonly prisma: PrismaService) {
        // Iyzico Payment Provider'a geçildi
        this.provider = new IyzicoPaymentProvider();
    }

    async initializePayment(orderId: string, cardInfo: any, ip: string, user: any): Promise<PaymentInitializeResult> {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: true,
                customer: true, // Assuming customer relation exists or we use user info
            }
        });

        if (!order) {
            throw new NotFoundException('Sipariş bulunamadı');
        }

        const params: PaymentInitializeParams = {
            orderId: order.id,
            price: Number(order.totalAmount),
            currency: 'TRY', // Default currency
            cardHolderName: cardInfo.cardHolderName,
            cardNumber: cardInfo.cardNumber,
            expireMonth: cardInfo.expireMonth,
            expireYear: cardInfo.expireYear,
            cvc: cardInfo.cvc,
            customerIp: ip,
            buyerEmail: user.email || 'guest@peykermoda.com', // Fallback for guest
            buyerName: `${user.firstName} ${user.lastName}` || 'Misafir Kullanıcı',
        };

        return this.provider.initializePayment(params);
    }

    async processCallback(payload: any): Promise<any> {
        this.logger.log('Processing payment callback', { payload });

        // Normalize callback params based on provider (Mock provider expects simple structure)
        // In real implementation, we might need a strategy to parse different provider callbacks
        const result = await this.provider.handleCallback({
            paymentId: payload.paymentId || payload.token, // Iyzico sends token
            status: payload.status,
            conversationId: payload.conversationId || payload.orderId,
            params: payload
        });

        if (result.status === 'SUCCESS') {
            await this.prisma.order.update({
                where: { id: result.orderId },
                data: {
                    status: OrderStatus.CONFIRMED,
                    paymentStatus: PaymentStatus.COMPLETED,
                    // We can also create a Transaction record here for accounting
                }
            });
            return { status: 'success', message: 'Ödeme başarılı', orderId: result.orderId };
        } else {
            await this.prisma.order.update({
                where: { id: result.orderId },
                data: { status: OrderStatus.CANCELLED } // Or keep PENDING but log failure
            });
            return { status: 'failure', message: 'Ödeme başarısız' };
        }
    }
}
