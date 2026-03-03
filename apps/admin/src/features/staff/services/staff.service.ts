import api from '@/lib/axios';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'ADMIN' | 'MANAGER' | 'CASHIER' | 'STOCK_MANAGER';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastLogin?: string;
}

export interface CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
}

export interface UpdateUserDto {
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    isActive?: boolean;
}

export interface UserQueryParams {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
    search?: string;
}

export const staffService = {
    async getAll(params?: UserQueryParams): Promise<User[]> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', String(params.page));
        if (params?.limit) queryParams.append('limit', String(params.limit));
        if (params?.role) queryParams.append('role', params.role);
        if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
        if (params?.search) queryParams.append('search', params.search);

        const response = await api.get(`/users?${queryParams}`);
        return response.data.data;
    },

    async getById(id: string): Promise<User> {
        const response = await api.get(`/users/${id}`);
        return response.data.data;
    },

    async create(data: CreateUserDto): Promise<User> {
        const response = await api.post('/users', data);
        return response.data.data;
    },

    async update(id: string, data: UpdateUserDto): Promise<User> {
        const response = await api.patch(`/users/${id}`, data);
        return response.data.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/users/${id}`);
    },

    async toggleStatus(id: string, isActive: boolean): Promise<User> {
        const response = await api.patch(`/users/${id}`, { isActive });
        return response.data.data;
    },

    // Role mapping for display
    getRoleLabel(role: string): string {
        const roles: Record<string, string> = {
            'ADMIN': 'Admin',
            'MANAGER': 'Yönetici',
            'CASHIER': 'Kasiyer',
            'STOCK_MANAGER': 'Stok Yöneticisi',
        };
        return roles[role] || role;
    },

    getRoleColor(role: string): string {
        const colors: Record<string, string> = {
            'ADMIN': 'bg-purple-100 text-purple-800',
            'MANAGER': 'bg-blue-100 text-blue-800',
            'CASHIER': 'bg-green-100 text-green-800',
            'STOCK_MANAGER': 'bg-amber-100 text-amber-800',
        };
        return colors[role] || 'bg-zinc-100 text-zinc-800';
    }
};
