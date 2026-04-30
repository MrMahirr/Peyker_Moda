export interface Banner {
    id: string;
    title: string;
    imageUrl: string;
    linkUrl?: string;
    position: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface Campaign {
    id: string;
    name: string;
    description?: string;
    type: 'DISCOUNT' | 'COUPON' | 'BULK_DISCOUNT';
    status: 'ACTIVE' | 'SCHEDULED' | 'ENDED' | 'DRAFT';
    code?: string; // For coupons
    startDate: string;
    endDate: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    minOrderAmount?: number;
    usageLimit?: number;
    usedCount: number;
    createdAt: string;
    updatedAt: string;
}

export type CampaignFormData = Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'usedCount'>;
