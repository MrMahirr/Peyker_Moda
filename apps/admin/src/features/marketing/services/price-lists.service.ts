import api from '../../../lib/axios';

export type PriceListScopeType = 'ALL_PRODUCTS' | 'CATEGORY' | 'PRODUCT';
export type PriceListAdjustmentType =
    | 'FIXED_PRICE'
    | 'PERCENTAGE_DISCOUNT'
    | 'FIXED_DISCOUNT';
export type PriceListEffectiveStatus =
    | 'ACTIVE'
    | 'INACTIVE'
    | 'SCHEDULED'
    | 'EXPIRED';

export interface PriceList {
    id: string;
    name: string;
    description?: string;
    customerGroupId?: string;
    customerGroupName?: string;
    scopeType: PriceListScopeType;
    scopeLabel: string;
    categoryId?: string;
    productId?: string;
    targetId?: string;
    targetName?: string;
    adjustmentType: PriceListAdjustmentType;
    amount: number;
    adjustmentLabel: string;
    currency: string;
    priority: number;
    isActive: boolean;
    effectiveStatus: PriceListEffectiveStatus;
    startsAt?: string;
    endsAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PriceListMetadataItem {
    id: string;
    name: string;
}

export interface PriceListMetadataProduct extends PriceListMetadataItem {
    sku: string;
}

export interface PriceListMetadata {
    customerGroups: PriceListMetadataItem[];
    categories: PriceListMetadataItem[];
    products: PriceListMetadataProduct[];
}

export interface CreatePriceListDto {
    name: string;
    description?: string;
    customerGroupId?: string;
    scopeType: PriceListScopeType;
    categoryId?: string;
    productId?: string;
    adjustmentType: PriceListAdjustmentType;
    amount: number;
    priority?: number;
    isActive?: boolean;
    startsAt?: string;
    endsAt?: string;
}

export const priceListsService = {
    async getAll(): Promise<PriceList[]> {
        const response = await api.get('/price-lists');
        return response.data.data;
    },

    async getMetadata(): Promise<PriceListMetadata> {
        const response = await api.get('/price-lists/metadata');
        return response.data.data;
    },

    async create(data: CreatePriceListDto): Promise<PriceList> {
        const response = await api.post('/price-lists', data);
        return response.data.data;
    },

    async update(id: string, data: Partial<CreatePriceListDto>): Promise<PriceList> {
        const response = await api.patch(`/price-lists/${id}`, data);
        return response.data.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/price-lists/${id}`);
    },
};
