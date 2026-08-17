import api from '../../../lib/axios';

export interface Product {
    id: string;
    name: string;
    sku: string;
    slug: string;
    description?: string;
    basePrice: number;
    salePrice?: number;
    currency: string;
    isActive: boolean;
    isFeatured: boolean;
    category?: {
        id: string;
        name: string;
    };
    variants?: ProductVariant[];
    images?: string[];
    totalStock?: number;
    createdAt: string;
    updatedAt: string;
}

export interface ProductVariant {
    id: string;
    productId: string;
    sku: string;
    barcode?: string;
    size?: string;
    color?: string;
    stock: number;
    price?: number;
}

export interface ProductQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface CreateProductDto {
    name: string;
    sku: string;
    description?: string;
    price: number;
    comparePrice?: number;
    cost?: number;
    categoryId: string;
    brand?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    mediaIds?: string[];
    variants?: {
        sku: string;
        price?: number;
        stock?: number;
        size?: string;
        color?: string;
        barcode?: string;
        colorCode?: string;
    }[];
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const productsService = {
    async getAll(params?: ProductQueryParams): Promise<PaginatedResponse<Product>> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', String(params.page));
        if (params?.limit) queryParams.append('limit', String(params.limit));
        if (params?.search) queryParams.append('search', params.search);
        if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
        if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
        if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

        const response = await api.get(`/products?${queryParams}`);
        const payload = response.data?.data ?? response.data ?? [];
        const data = Array.isArray(payload) ? payload : [];
        const meta = response.data?.meta ?? {
            total: data.length,
            page: params?.page ?? 1,
            limit: params?.limit ?? data.length,
            totalPages: 1
        };
        return { data, meta };
    },

    async getById(id: string): Promise<Product> {
        const response = await api.get(`/products/${id}`);
        return response.data.data;
    },

    async create(data: CreateProductDto): Promise<Product> {
        const response = await api.post('/products', data);
        return response.data.data;
    },

    async update(id: string, data: Partial<CreateProductDto>): Promise<Product> {
        const response = await api.patch(`/products/${id}`, data);
        return response.data.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/products/${id}`);
    },

    async getCategories() {
        const response = await api.get('/categories');
        return response.data.data;
    }
};
