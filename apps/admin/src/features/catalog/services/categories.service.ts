import api from '../../../lib/axios';

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parentId?: string;
    parent?: Category;
    children?: Category[];
    isActive: boolean;
    sortOrder: number;
    _count?: {
        products: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateCategoryDto {
    name: string;
    description?: string;
    image?: string;
    parentId?: string;
    isActive?: boolean;
    sortOrder?: number;
}

export const categoriesService = {
    async getAll(): Promise<Category[]> {
        const response = await api.get('/categories');
        return response.data.data;
    },

    async getTree(): Promise<Category[]> {
        const response = await api.get('/categories/tree');
        return response.data.data;
    },

    async getById(id: string): Promise<Category> {
        const response = await api.get(`/categories/${id}`);
        return response.data.data;
    },

    async create(data: CreateCategoryDto): Promise<Category> {
        const response = await api.post('/categories', data);
        return response.data.data;
    },

    async update(id: string, data: Partial<CreateCategoryDto>): Promise<Category> {
        const response = await api.patch(`/categories/${id}`, data);
        return response.data.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/categories/${id}`);
    }
};
