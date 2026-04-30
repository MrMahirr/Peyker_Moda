import api from '../../../lib/axios';
import type {
    BlogPost,
    CustomPage,
    FaqItem,
} from '../types';

export interface CreateBlogPostDto {
    title: string;
    slug?: string;
    excerpt: string;
    content: string;
    image?: string;
    isPublished?: boolean;
}

export interface CreateCustomPageDto {
    title: string;
    slug?: string;
    content: string;
    isPublished?: boolean;
    isSystem?: boolean;
}

export interface CreateFaqItemDto {
    question: string;
    answer: string;
    category?: string;
    order?: number;
    isActive?: boolean;
}

export const cmsService = {
    async getBlogPosts(): Promise<BlogPost[]> {
        const response = await api.get('/cms/blog-posts');
        return response.data.data;
    },

    async createBlogPost(data: CreateBlogPostDto): Promise<BlogPost> {
        const response = await api.post('/cms/blog-posts', data);
        return response.data.data;
    },

    async updateBlogPost(id: string, data: Partial<CreateBlogPostDto>): Promise<BlogPost> {
        const response = await api.patch(`/cms/blog-posts/${id}`, data);
        return response.data.data;
    },

    async deleteBlogPost(id: string): Promise<void> {
        await api.delete(`/cms/blog-posts/${id}`);
    },

    async getPages(): Promise<CustomPage[]> {
        const response = await api.get('/cms/pages');
        return response.data.data;
    },

    async createPage(data: CreateCustomPageDto): Promise<CustomPage> {
        const response = await api.post('/cms/pages', data);
        return response.data.data;
    },

    async updatePage(id: string, data: Partial<CreateCustomPageDto>): Promise<CustomPage> {
        const response = await api.patch(`/cms/pages/${id}`, data);
        return response.data.data;
    },

    async deletePage(id: string): Promise<void> {
        await api.delete(`/cms/pages/${id}`);
    },

    async getFaqs(): Promise<FaqItem[]> {
        const response = await api.get('/cms/faqs');
        return response.data.data;
    },

    async createFaq(data: CreateFaqItemDto): Promise<FaqItem> {
        const response = await api.post('/cms/faqs', data);
        return response.data.data;
    },

    async updateFaq(id: string, data: Partial<CreateFaqItemDto>): Promise<FaqItem> {
        const response = await api.patch(`/cms/faqs/${id}`, data);
        return response.data.data;
    },

    async deleteFaq(id: string): Promise<void> {
        await api.delete(`/cms/faqs/${id}`);
    },
};
