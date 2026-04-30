export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';

export interface Order {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    customerId?: string;
    customerName?: string;
    items: OrderItem[];
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
    paymentMethod?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    id: string;
    productName: string;
    variantName?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface OrderNote {
    id: string;
    orderId: string;
    content: string;
    isInternal: boolean;
    userId: string;
    userName?: string;
    createdAt: string;
}

export type ReturnStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export interface ReturnRequest {
    id: string;
    orderId: string;
    orderNumber?: string;
    status: ReturnStatus;
    reason: string;
    items: { productName: string; quantity: number; amount: number }[];
    totalAmount: number;
    createdAt: string;
}
