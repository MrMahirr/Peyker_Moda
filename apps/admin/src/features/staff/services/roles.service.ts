import api from '@/lib/axios';

export interface RolePermission {
    id: string;
    resource: string;
    action: string;
}

export interface Role {
    id: string;
    name: string;
    displayName: string;
    description?: string | null;
    isSystem?: boolean;
    permissions: RolePermission[];
    _count?: {
        users: number;
    };
}

export interface CreateRoleDto {
    name: string;
    displayName: string;
    description?: string;
    permissions?: { resource: string; action: string }[];
}

export interface UpdateRoleDto {
    displayName?: string;
    description?: string;
}

export const rolesService = {
    async getAll(): Promise<Role[]> {
        const response = await api.get('/roles');
        return response.data.data || [];
    },

    async getById(id: string): Promise<Role> {
        const response = await api.get(`/roles/${id}`);
        return response.data.data;
    },

    async create(data: CreateRoleDto): Promise<Role> {
        const response = await api.post('/roles', data);
        return response.data.data;
    },

    async update(id: string, data: UpdateRoleDto): Promise<Role> {
        const response = await api.patch(`/roles/${id}`, data);
        return response.data.data;
    },

    async remove(id: string): Promise<void> {
        await api.delete(`/roles/${id}`);
    },

    async assignPermissions(id: string, permissions: { resource: string; action: string }[]): Promise<Role> {
        const response = await api.put(`/roles/${id}/permissions`, { permissions });
        return response.data.data;
    },
};
