import Iyzipay = require('iyzipay');
import {
    PaymentProvider,
    PaymentInitializeParams,
    PaymentInitializeResult,
    PaymentCallbackParams
} from './payment.provider.interface';

export class IyzicoPaymentProvider implements PaymentProvider {
    private iyzipay: any;

    constructor() {
        this.iyzipay = new Iyzipay({
            apiKey: process.env.IYZICO_API_KEY || 'sandbox-api-key',
            secretKey: process.env.IYZICO_SECRET_KEY || 'sandbox-secret-key',
            uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
        });
    }

    async initializePayment(params: PaymentInitializeParams): Promise<PaymentInitializeResult> {
        return new Promise((resolve, reject) => {
            const request = {
                locale: Iyzipay.LOCALE.TR,
                conversationId: params.orderId,
                price: params.price.toString(),
                paidPrice: params.price.toString(),
                currency: Iyzipay.CURRENCY.TRY,
                installment: '1',
                basketId: params.orderId,
                paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
                paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
                paymentCard: {
                    cardHolderName: params.cardHolderName,
                    cardNumber: params.cardNumber,
                    expireMonth: params.expireMonth,
                    expireYear: params.expireYear,
                    cvc: params.cvc,
                    registerCard: '0'
                },
                buyer: {
                    id: params.buyerEmail, // Or customer ID if available
                    name: params.buyerName.split(' ')[0] || 'Müşteri',
                    surname: params.buyerName.split(' ')[1] || 'Soyadı',
                    gsmNumber: '+905555555555', // Placeholder if not provided
                    email: params.buyerEmail,
                    identityNumber: '11111111111',
                    registrationAddress: 'Türkiye',
                    ip: params.customerIp || '85.34.78.112',
                    city: 'Istanbul',
                    country: 'Turkey',
                    zipCode: '34732'
                },
                shippingAddress: {
                    contactName: params.buyerName,
                    city: 'Istanbul',
                    country: 'Turkey',
                    address: 'Türkiye',
                    zipCode: '34732'
                },
                billingAddress: {
                    contactName: params.buyerName,
                    city: 'Istanbul',
                    country: 'Turkey',
                    address: 'Türkiye',
                    zipCode: '34732'
                },
                basketItems: [
                    {
                        id: 'ITEM1',
                        name: 'Sipariş Sepeti',
                        category1: 'Giyim',
                        itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
                        price: params.price.toString()
                    }
                ]
            };

            this.iyzipay.payment.create(request, (err: any, result: any) => {
                if (err) {
                    return reject(err);
                }

                if (result.status === 'success') {
                    resolve({
                        transactionId: result.paymentId,
                        status: 'SUCCESS',
                        rawResponse: result
                    });
                } else {
                    resolve({
                        transactionId: '',
                        status: 'FAILURE',
                        rawResponse: result
                    });
                }
            });
        });
    }

    async handleCallback(params: PaymentCallbackParams): Promise<{ status: 'SUCCESS' | 'FAILURE'; orderId: string; transactionId: string }> {
        // Normalde Iyzico 3D Secure callback'inde ödemeyi tamamlamak için `threeds.auth.create` çağrılır.
        // Şimdilik Non-3D payment yapıldığı için bu mock'landı.
        return {
            status: params.status === 'success' ? 'SUCCESS' : 'FAILURE',
            orderId: params.conversationId || '',
            transactionId: params.paymentId || ''
        };
    }
}
