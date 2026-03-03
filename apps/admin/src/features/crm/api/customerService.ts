import api from '../../../lib/axios';

export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    address?: string;
    notes?: string;
    group?: {
        id: string;
        name: string;
    };
    totalSpent?: number;
    orderCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CustomerQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    groupId?: string;
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

export interface CreateCustomerDto {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    address?: string;
    notes?: string;
    groupId?: string;
}

export const customersService = {
    async getAll(params?: CustomerQueryParams): Promise<PaginatedResponse<Customer>> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', String(params.page));
        if (params?.limit) queryParams.append('limit', String(params.limit));
        if (params?.search) queryParams.append('search', params.search);
        if (params?.groupId) queryParams.append('groupId', params.groupId);

        const response = await api.get(`/customers?${queryParams}`);
        return response.data.data;
    },

    async getById(id: string): Promise<Customer> {
        const response = await api.get(`/customers/${id}`);
        return response.data.data;
    },

    async create(data: CreateCustomerDto): Promise<Customer> {
        const response = await api.post('/customers', data);
        return response.data.data;
    },

    async update(id: string, data: Partial<CreateCustomerDto>): Promise<Customer> {
        const response = await api.patch(`/customers/${id}`, data);
        return response.data.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/customers/${id}`);
    },

    async getGroups() {
        const response = await api.get('/customer-groups');
        return response.data.data;
    }
};
