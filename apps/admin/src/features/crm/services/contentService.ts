import api from '../../../lib/axios';
import { Banner, PageHeader, PageSlug } from '../types/content.types';

export const bannerService = {
  getAll: async () => {
    const response = await api.get('/banners');
    return response.data.data;
  },
  create: async (data: Partial<Banner>) => {
    const response = await api.post('/banners', data);
    return response.data.data;
  },
  update: async (id: string, data: Partial<Banner>) => {
    const response = await api.patch(`/banners/${id}`, data);
    return response.data.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/banners/${id}`);
    return response.data.data;
  }
};

export const pageHeaderService = {
  getAll: async () => {
    const response = await api.get('/banners/page-headers/all');
    return response.data.data;
  },
  upsert: async (pageSlug: PageSlug | string, data: Partial<PageHeader>) => {
    const response = await api.put(`/banners/page-headers/${pageSlug}`, data);
    return response.data.data;
  }
};
