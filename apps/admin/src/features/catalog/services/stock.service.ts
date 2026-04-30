import api from '../../../lib/axios';
import type {
    StockMovement,
    StockMovementQueryParams,
    StockCount,
    StockAlert,
    Warehouse,
    Brand,
    Tag,
    Season,
} from '../types/stock.types';

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const stockService = {
    // ── Stock Movements ──
    async getMovements(params?: StockMovementQueryParams): Promise<PaginatedResponse<StockMovement>> {
        const q = new URLSearchParams();
        if (params?.page) q.append('page', String(params.page));
        if (params?.limit) q.append('limit', String(params.limit));
        if (params?.type) q.append('type', params.type);
        if (params?.variantId) q.append('variantId', params.variantId);
        if (params?.warehouseId) q.append('warehouseId', params.warehouseId);
        if (params?.startDate) q.append('startDate', params.startDate);
        if (params?.endDate) q.append('endDate', params.endDate);
        if (params?.search) q.append('search', params.search);
        const response = await api.get(`/stock/movements?${q}`);
        return response.data;
    },

    async createMovement(data: {
        type: StockMovement['type'];
        variantId: string;
        quantity: number;
        reason?: string;
        sourceWarehouseId?: string;
        targetWarehouseId?: string;
    }): Promise<StockMovement> {
        const response = await api.post('/stock/movements', data);
        return response.data.data;
    },

    // ── Stock Count ──
    async getStockCounts(): Promise<StockCount[]> {
        const response = await api.get('/stock/counts');
        return response.data.data;
    },

    async createStockCount(data: { warehouseId?: string; notes?: string }): Promise<StockCount> {
        const response = await api.post('/stock/counts', data);
        return response.data.data;
    },

    async updateStockCountItem(countId: string, item: { variantId: string; countedStock: number }): Promise<void> {
        await api.patch(`/stock/counts/${countId}/items`, item);
    },

    async completeStockCount(countId: string): Promise<StockCount> {
        const response = await api.post(`/stock/counts/${countId}/complete`);
        return response.data.data;
    },

    // ── Stock Alerts ──
    async getAlerts(): Promise<StockAlert[]> {
        const response = await api.get('/stock/alerts');
        return response.data.data;
    },

    async updateMinimumStock(variantId: string, minimum: number): Promise<void> {
        await api.patch(`/stock/alerts/${variantId}`, { minimumStock: minimum });
    },

    // ── Warehouses ──
    async getWarehouses(): Promise<Warehouse[]> {
        const response = await api.get('/warehouses');
        return response.data.data;
    },

    async createWarehouse(data: Partial<Warehouse>): Promise<Warehouse> {
        const response = await api.post('/warehouses', data);
        return response.data.data;
    },

    async updateWarehouse(id: string, data: Partial<Warehouse>): Promise<Warehouse> {
        const response = await api.patch(`/warehouses/${id}`, data);
        return response.data.data;
    },

    async deleteWarehouse(id: string): Promise<void> {
        await api.delete(`/warehouses/${id}`);
    },

    // ── Brands ──
    async getBrands(): Promise<Brand[]> {
        const response = await api.get('/brands');
        return response.data.data;
    },

    async createBrand(data: { name: string; logo?: string }): Promise<Brand> {
        const response = await api.post('/brands', data);
        return response.data.data;
    },

    async updateBrand(id: string, data: Partial<Brand>): Promise<Brand> {
        const response = await api.patch(`/brands/${id}`, data);
        return response.data.data;
    },

    async deleteBrand(id: string): Promise<void> {
        await api.delete(`/brands/${id}`);
    },

    // ── Tags ──
    async getTags(): Promise<Tag[]> {
        const response = await api.get('/tags');
        return response.data.data;
    },

    async createTag(data: { name: string; color?: string }): Promise<Tag> {
        const response = await api.post('/tags', data);
        return response.data.data;
    },

    async deleteTag(id: string): Promise<void> {
        await api.delete(`/tags/${id}`);
    },

    // ── Seasons ──
    async getSeasons(): Promise<Season[]> {
        const response = await api.get('/seasons');
        return response.data.data;
    },

    async createSeason(data: Partial<Season>): Promise<Season> {
        const response = await api.post('/seasons', data);
        return response.data.data;
    },

    async updateSeason(id: string, data: Partial<Season>): Promise<Season> {
        const response = await api.patch(`/seasons/${id}`, data);
        return response.data.data;
    },

    async deleteSeason(id: string): Promise<void> {
        await api.delete(`/seasons/${id}`);
    },

    // ── Bulk Import/Export ──
    async importProducts(file: File): Promise<{ imported: number; errors: string[] }> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/products/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    },

    async exportProducts(format: 'csv' | 'xlsx'): Promise<Blob> {
        const response = await api.get(`/products/export?format=${format}`, {
            responseType: 'blob',
        });
        return response.data;
    },
};
