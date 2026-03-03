
import { Injectable, Logger } from '@nestjs/common';
import { PaymentProvider, PaymentInitializeParams, PaymentInitializeResult, PaymentCallbackParams } from './payment.provider.interface';

@Injectable()
export class MockPaymentProvider implements PaymentProvider {
    private readonly logger = new Logger(MockPaymentProvider.name);

    async initializePayment(params: PaymentInitializeParams): Promise<PaymentInitializeResult> {
        this.logger.log(`Initializing mock payment for order ${params.orderId} with amount ${params.price} ${params.currency}`);

        // Mock 3D Secure flow simulation
        // In a real scenario, this would return an HTML content or Redirect URL from Iyzico
        return {
            transactionId: `mock-txn-${Date.now()}`,
            status: 'SUCCESS',
            threeDSecureUrl: `http://localhost:3000/odeme/simulasyon?orderId=${params.orderId}&amount=${params.price}&txn=${Date.now()}`,
            rawResponse: { mock: true }
        };
    }

    async handleCallback(params: PaymentCallbackParams): Promise<{ status: 'SUCCESS' | 'FAILURE'; orderId: string; transactionId: string }> {
        this.logger.log(`Handling mock callback for payment ${params.paymentId}`);

        // Simulate validation
        if (params.status === 'success') {
            return {
                status: 'SUCCESS',
                orderId: params.conversationId || '',
                transactionId: params.paymentId
            };
        }

        return {
            status: 'FAILURE',
            orderId: params.conversationId || '',
            transactionId: params.paymentId
        };
    }
}
