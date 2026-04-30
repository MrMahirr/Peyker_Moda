import api from '@/lib/axios';

export interface StoreSettings {
    id: string;
    storeName: string;
    storeAddress: string;
    storePhone: string;
    storeEmail: string;
    currency: string;
    taxRate: number;
    lowStockThreshold: number;
    receiptHeader: string;
    receiptFooter: string;
    receiptAddress: string;
    receiptPhone: string;
    receiptTaxRate: number;
    receiptShowLogo: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateSettingsDto {
    storeName?: string;
    storeAddress?: string;
    storePhone?: string;
    storeEmail?: string;
    currency?: string;
    taxRate?: number;
    lowStockThreshold?: number;
    receiptHeader?: string;
    receiptFooter?: string;
    receiptAddress?: string;
    receiptPhone?: string;
    receiptTaxRate?: number;
    receiptShowLogo?: boolean;
}

export const settingsService = {
    async getSettings(): Promise<StoreSettings> {
        try {
            const response = await api.get('/settings');
            return response.data.data;
        } catch (error) {
            // Return defaults if settings endpoint doesn't exist
            const now = new Date().toISOString();
            return {
                id: '1',
                storeName: 'Peyker Moda',
                storeAddress: 'Istanbul, Turkiye',
                storePhone: '+90 555 123 4567',
                storeEmail: 'info@peykermoda.com',
                currency: 'TRY',
                taxRate: 18,
                lowStockThreshold: 10,
                receiptHeader: 'Peyker Moda',
                receiptFooter: 'Tesekkur ederiz, yine bekleriz.',
                receiptAddress: 'Istanbul, Turkiye',
                receiptPhone: '+90 555 123 4567',
                receiptTaxRate: 18,
                receiptShowLogo: true,
                createdAt: now,
                updatedAt: now,
            };
        }
    },

    async updateSettings(data: UpdateSettingsDto): Promise<StoreSettings> {
        const response = await api.patch('/settings', data);
        return response.data.data;
    },

    // Profile settings
    async getProfile(): Promise<any> {
        const response = await api.get('/auth/profile');
        return response.data.data;
    },

    async updateProfile(data: { firstName?: string; lastName?: string; email?: string }): Promise<any> {
        const response = await api.patch('/auth/profile', data);
        return response.data.data;
    },

    async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
        await api.post('/auth/change-password', data);
    }
};
