import api from '../../../lib/axios';

export interface Order {
    id: string;
    orderNumber: string;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    customer?: {
        id: string;
        firstName: string;
        lastName: string;
        phone: string;
        email?: string;
    };
    items?: OrderItem[];
    shippingAddress?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    id: string;
    productName: string;
    variantInfo: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface OrderQueryParams {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const ordersService = {
    async getAll(params?: OrderQueryParams): Promise<PaginatedResponse<Order>> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', String(params.page));
        if (params?.limit) queryParams.append('limit', String(params.limit));
        if (params?.status) queryParams.append('status', params.status);
        if (params?.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus);
        if (params?.search) queryParams.append('search', params.search);

        const response = await api.get(`/orders?${queryParams}`);
        return response.data;
    },

    async getById(id: string): Promise<Order> {
        const response = await api.get(`/orders/${id}`);
        return response.data.data;
    },

    async updateStatus(id: string, status: string): Promise<Order> {
        const response = await api.patch(`/orders/${id}/status`, { status });
        return response.data.data;
    },

    async shipOrder(id: string): Promise<Order> {
        const response = await api.post(`/orders/${id}/ship`, {});
        return response.data.data;
    },

    async cancel(id: string, reason?: string): Promise<Order> {
        const response = await api.post(`/orders/${id}/cancel`, { reason });
        return response.data.data;
    }
};
