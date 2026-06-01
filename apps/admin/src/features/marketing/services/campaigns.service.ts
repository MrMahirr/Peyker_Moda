import api from '../../../lib/axios';

export interface Campaign {
    id: string;
    name: string;
    description?: string;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y';
    discountValue: number;
    code?: string;
    minOrderAmount?: number;
    maxUsage?: number;
    usageCount: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Coupon {
    id: string;
    code: string;
    description?: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    minOrderAmount?: number;
    maxUsage?: number;
    usageCount: number;
    expiresAt: string;
    isActive: boolean;
    createdAt: string;
}

export interface CreateCampaignDto {
    name: string;
    description?: string;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y';
    discountValue: number;
    code?: string;
    minOrderAmount?: number;
    maxUsage?: number;
    startDate: string;
    endDate: string;
    isActive?: boolean;
}

export interface CreateCouponDto {
    code: string;
    description?: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    minOrderAmount?: number;
    maxUsage?: number;
    expiresAt: string;
    isActive?: boolean;
}

export const campaignsService = {
    // Campaigns
    async getAllCampaigns(): Promise<Campaign[]> {
        const response = await api.get('/campaigns?includeInactive=true');
        // Backend returns the array directly, so response.data is the array
        return response.data.data || response.data;
    },

    async getCampaignById(id: string): Promise<Campaign> {
        const response = await api.get(`/campaigns/${id}`);
        return response.data.data || response.data;
    },

    async createCampaign(data: CreateCampaignDto): Promise<Campaign> {
        const response = await api.post('/campaigns', data);
        return response.data.data || response.data;
    },

    async updateCampaign(id: string, data: Partial<CreateCampaignDto>): Promise<Campaign> {
        const response = await api.patch(`/campaigns/${id}`, data);
        return response.data.data || response.data;
    },

    async deleteCampaign(id: string): Promise<void> {
        await api.delete(`/campaigns/${id}`);
    },

    // Coupons
    async getAllCoupons(): Promise<Coupon[]> {
        const response = await api.get('/coupons');
        return response.data.data || response.data;
    },

    async getCouponById(id: string): Promise<Coupon> {
        const response = await api.get(`/coupons/${id}`);
        return response.data.data || response.data;
    },

    async createCoupon(data: CreateCouponDto): Promise<Coupon> {
        const response = await api.post('/coupons', data);
        return response.data.data || response.data;
    },

    async updateCoupon(id: string, data: Partial<CreateCouponDto>): Promise<Coupon> {
        const response = await api.patch(`/coupons/${id}`, data);
        return response.data.data || response.data;
    },

    async deleteCoupon(id: string): Promise<void> {
        await api.delete(`/coupons/${id}`);
    },

    async validateCoupon(code: string): Promise<Coupon> {
        const response = await api.post('/coupons/validate', { code });
        return response.data.data || response.data;
    }
};
