import api from '../../../lib/axios';
import { Product } from './products.service';

export interface Collection {
    id: string;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    order: number;
    isActive: boolean;
    products?: Product[];
    _count?: {
        products: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateCollectionDto {
    name: string;
    slug?: string;
    description?: string;
    imageUrl?: string;
    order?: number;
    isActive?: boolean;
}

export const collectionsService = {
    async getAll(): Promise<Collection[]> {
        const response = await api.get('/collections');
        return response.data.data;
    },

    async getById(id: string): Promise<Collection> {
        const response = await api.get(`/collections/${id}`);
        return response.data.data;
    },

    async create(data: CreateCollectionDto): Promise<Collection> {
        const response = await api.post('/collections', data);
        return response.data.data;
    },

    async update(id: string, data: Partial<CreateCollectionDto>): Promise<Collection> {
        const response = await api.patch(`/collections/${id}`, data);
        return response.data.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/collections/${id}`);
    },

    async setProducts(id: string, productIds: string[]): Promise<Collection> {
        const response = await api.put(`/collections/${id}/products`, { productIds });
        return response.data.data;
    },
};
