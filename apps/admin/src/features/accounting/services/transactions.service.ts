import api from '../../../lib/axios';

export interface Transaction {
    id: string;
    type: 'INCOME' | 'EXPENSE';
    category?: string;
    amount: number;
    description?: string;
    reference?: string;
    paymentMethod?: string;
    orderId?: string;
    transactionDate: string;
    userId: string;
    user?: {
        id: string;
        firstName: string;
        lastName: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface TransactionQueryParams {
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
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

export interface ReportSummary {
    period: { start: string; end: string };
    income: { transactions: number; sales: number; total: number; count: number };
    expense: { total: number; count: number };
    netProfit: number;
}

export const transactionsService = {
    async getAll(params?: TransactionQueryParams): Promise<PaginatedResponse<Transaction>> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', String(params.page));
        if (params?.limit) queryParams.append('limit', String(params.limit));
        if (params?.type) queryParams.append('type', params.type);
        if (params?.category) queryParams.append('category', params.category);
        if (params?.startDate) queryParams.append('startDate', params.startDate);
        if (params?.endDate) queryParams.append('endDate', params.endDate);
        if (params?.search) queryParams.append('search', params.search);

        const response = await api.get(`/transactions?${queryParams}`);
        return response.data;
    },

    async getById(id: string): Promise<Transaction> {
        const response = await api.get(`/transactions/${id}`);
        return response.data.data;
    },

    async create(data: Partial<Transaction>): Promise<Transaction> {
        const response = await api.post('/transactions', data);
        return response.data.data;
    },

    async getSummary(startDate: string, endDate: string): Promise<ReportSummary> {
        const response = await api.get(`/reports/summary?startDate=${startDate}&endDate=${endDate}`);
        return response.data?.data || response.data;
    }
};
