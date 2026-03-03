
export interface PaymentInitializeParams {
    orderId: string;
    price: number;
    currency: string;
    cardHolderName: string;
    cardNumber: string;
    expireMonth: string;
    expireYear: string;
    cvc: string;
    customerIp: string;
    buyerEmail: string;
    buyerName: string;
}

export interface PaymentInitializeResult {
    transactionId: string;
    status: 'SUCCESS' | 'FAILURE';
    threeDSecureUrl?: string; // If 3D secure is required
    rawResponse?: any;
}

export interface PaymentCallbackParams {
    paymentId: string;
    status: string;
    conversationId?: string; // orderId
    params: any; // Raw params from provider
}

export interface PaymentProvider {
    initializePayment(params: PaymentInitializeParams): Promise<PaymentInitializeResult>;
    handleCallback(params: PaymentCallbackParams): Promise<{ status: 'SUCCESS' | 'FAILURE'; orderId: string; transactionId: string }>;
}
