import api from '../../../lib/axios';
import type { LoyaltyTier, LoyaltyPoints } from '../types';

export const loyaltyService = {
    async getTiers(): Promise<LoyaltyTier[]> { const r = await api.get('/loyalty/tiers'); return r.data.data; },
    async createTier(data: Partial<LoyaltyTier>): Promise<LoyaltyTier> { const r = await api.post('/loyalty/tiers', data); return r.data.data; },
    async updateTier(id: string, data: Partial<LoyaltyTier>): Promise<LoyaltyTier> { const r = await api.patch(`/loyalty/tiers/${id}`, data); return r.data.data; },
    async deleteTier(id: string): Promise<void> { await api.delete(`/loyalty/tiers/${id}`); },
    async getCustomerPoints(customerId: string): Promise<LoyaltyPoints> { const r = await api.get(`/loyalty/customers/${customerId}`); return r.data.data; },
    async addPoints(customerId: string, points: number, reason: string): Promise<void> { await api.post(`/loyalty/customers/${customerId}/add`, { points, reason }); },
};
