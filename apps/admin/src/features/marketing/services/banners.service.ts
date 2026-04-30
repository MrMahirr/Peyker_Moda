import api from '../../../lib/axios';
import type { Banner } from '../types';

export interface CreateBannerDto {
    title: string;
    imageUrl: string;
    linkUrl?: string;
    position?: number;
    isActive?: boolean;
}

export const bannersService = {
    async getAll(): Promise<Banner[]> {
        const response = await api.get('/banners');
        return response.data.data;
    },

    async create(data: CreateBannerDto): Promise<Banner> {
        const response = await api.post('/banners', data);
        return response.data.data;
    },

    async update(id: string, data: Partial<CreateBannerDto>): Promise<Banner> {
        const response = await api.patch(`/banners/${id}`, data);
        return response.data.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/banners/${id}`);
    },
};
