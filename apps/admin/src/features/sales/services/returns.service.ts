import api from '../../../lib/axios';

export interface ReturnRequest {
    id: string;
    orderId: string;
    orderNumber?: string;
    customer: string;
    date: string;
    amount: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    reason: string;
    notes?: string;
    createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
    PENDING: 'Bekliyor',
    APPROVED: 'Onaylandı',
    REJECTED: 'Reddedildi',
};

export const returnsService = {
    async getAll(): Promise<ReturnRequest[]> {
        try {
            const response = await api.get('/orders?status=RETURN_REQUESTED&limit=50');
            const orders = response.data?.data?.data || response.data?.data || [];
            // Map orders with RETURN_REQUESTED status to ReturnRequest format
            return orders.map((order: any) => ({
                id: `RET-${order.id?.slice(-4) || '0000'}`,
                orderId: order.orderNumber || order.id,
                orderNumber: order.orderNumber,
                customer: order.customer
                    ? `${order.customer.firstName} ${order.customer.lastName}`
                    : 'Bilinmeyen Müşteri',
                date: order.updatedAt || order.createdAt,
                amount: order.total || 0,
                status: order.paymentStatus === 'REFUNDED' ? 'APPROVED' : 'PENDING',
                reason: order.notes || 'Belirtilmemiş',
                createdAt: order.createdAt,
            }));
        } catch (error) {
            console.error('Returns fetch error:', error);
            return [];
        }
    },

    async approve(orderId: string): Promise<void> {
        await api.patch(`/orders/${orderId}/status`, { status: 'RETURNED' });
    },

    async reject(orderId: string, reason?: string): Promise<void> {
        await api.patch(`/orders/${orderId}/status`, { status: 'CANCELLED', reason });
    },

    getStatusLabel(status: string): string {
        return STATUS_LABELS[status] || status;
    },
};
