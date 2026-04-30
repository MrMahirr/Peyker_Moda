import api from '../../../lib/axios';
import type { Role, Permission, StaffMember, StaffPerformance } from '../types';

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    roleId?: string;
    isActive: boolean;
    createdAt: string;
}

export interface UserInput {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    role?: string;
    roleId?: string;
    isActive?: boolean;
}

export interface RoleInput {
    name: string;
    displayName: string;
    description?: string;
    permissions?: { resource: string; action: string }[];
}

interface ApiRole {
    id: string;
    name: string;
    displayName?: string;
    description?: string | null;
    isSystem?: boolean;
    permissions?: { id: string; resource: string; action: string }[];
}

interface ApiUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    roleId?: string;
    role?: ApiRole;
    isActive: boolean;
    createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
    admin: 'Admin',
    manager: 'Yonetici',
    staff: 'Personel',
    cashier: 'Kasiyer',
    ADMIN: 'Admin',
    MANAGER: 'Yonetici',
    STAFF: 'Personel',
    CASHIER: 'Kasiyer',
};

const normalizeRoleKey = (value?: string) => value?.toLowerCase() || '';

const mapUser = (user: ApiUser): User => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role?.name ? user.role.name.toUpperCase() : 'STAFF',
    roleId: user.role?.id || user.roleId,
    isActive: user.isActive,
    createdAt: user.createdAt,
});

const unwrapList = <T>(payload: any): T[] => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const unwrapObject = <T>(payload: any): T => {
    if (payload?.data !== undefined) return payload.data;
    return payload;
};

let cachedRoles: { data: ApiRole[]; fetchedAt: number } | null = null;

const fetchRolesRaw = async (): Promise<ApiRole[]> => {
    if (cachedRoles && Date.now() - cachedRoles.fetchedAt < 60_000) {
        return cachedRoles.data;
    }
    const response = await api.get('/roles');
    const roles = unwrapList<ApiRole>(response.data);
    cachedRoles = { data: roles, fetchedAt: Date.now() };
    return roles;
};

const resolveRoleId = async (role?: string, roleId?: string) => {
    if (roleId) return roleId;
    if (!role) return undefined;
    const roles = await fetchRolesRaw();
    const key = normalizeRoleKey(role);
    const matched = roles.find((r) =>
        normalizeRoleKey(r.name) === key || normalizeRoleKey(r.displayName) === key
    );
    return matched?.id;
};

const fetchUsers = async (): Promise<User[]> => {
    const response = await api.get('/users');
    const users = unwrapList<ApiUser>(response.data);
    return users.map(mapUser);
};

export const staffService = {
    getRoleLabel(role: string) {
        return ROLE_LABELS[role] || ROLE_LABELS[role.toLowerCase()] || role;
    },

    async getPermissions(): Promise<Permission[]> {
        const roles = await fetchRolesRaw();
        const map = new Map<string, Permission>();
        roles.forEach((role) => {
            role.permissions?.forEach((perm) => {
                if (!map.has(perm.id)) {
                    map.set(perm.id, {
                        id: perm.id,
                        name: `${perm.resource}:${perm.action}`,
                        description: '',
                        module: perm.resource,
                    });
                }
            });
        });
        return Array.from(map.values());
    },

    async getRoles(): Promise<Role[]> {
        const roles = await fetchRolesRaw();
        return roles.map((role) => ({
            id: role.id,
            name: role.displayName || role.name,
            description: role.description || '',
            permissions: role.permissions?.map((p) => p.id) || [],
            isSystem: Boolean(role.isSystem),
        }));
    },

    async createRole(data: RoleInput): Promise<Role> {
        const response = await api.post('/roles', data);
        const role = unwrapObject<ApiRole>(response.data);
        return {
            id: role.id,
            name: role.displayName || role.name,
            description: role.description || '',
            permissions: role.permissions?.map((p) => p.id) || [],
            isSystem: Boolean(role.isSystem),
        };
    },

    async updateRole(id: string, data: Partial<RoleInput>): Promise<Role> {
        const response = await api.patch(`/roles/${id}`, data);
        const role = unwrapObject<ApiRole>(response.data);
        return {
            id: role.id,
            name: role.displayName || role.name,
            description: role.description || '',
            permissions: role.permissions?.map((p) => p.id) || [],
            isSystem: Boolean(role.isSystem),
        };
    },

    async deleteRole(id: string): Promise<void> {
        await api.delete(`/roles/${id}`);
    },

    async getAll(): Promise<User[]> {
        return fetchUsers();
    },

    async create(data: UserInput): Promise<User> {
        const roleId = await resolveRoleId(data.role, data.roleId);
        const response = await api.post('/users', {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            roleId,
        });
        return mapUser(unwrapObject<ApiUser>(response.data));
    },

    async update(id: string, data: Partial<UserInput>): Promise<User> {
        const roleId = await resolveRoleId(data.role, data.roleId);
        const response = await api.patch(`/users/${id}`, {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            isActive: data.isActive,
            roleId,
        });
        return mapUser(unwrapObject<ApiUser>(response.data));
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/users/${id}`);
    },

    async toggleStatus(id: string, isActive: boolean): Promise<User> {
        return this.update(id, { isActive });
    },

    async getStaff(): Promise<User[]> {
        return fetchUsers();
    },
    async createStaff(data: Partial<StaffMember>): Promise<StaffMember> {
        return (await api.post('/users', data)).data.data;
    },
    async updateStaff(id: string, data: Partial<StaffMember>): Promise<StaffMember> {
        return (await api.patch(`/users/${id}`, data)).data.data;
    },
    async deleteStaff(id: string): Promise<void> {
        await api.delete(`/users/${id}`);
    },

    async getPerformance(startDate?: string, endDate?: string): Promise<StaffPerformance[]> {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const response = await api.get(`/staff/performance?${params.toString()}`);
        return response.data.data || [];
    }
};
