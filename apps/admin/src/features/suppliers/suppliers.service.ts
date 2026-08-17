import axiosInstance from '@/lib/axios';
import { Supplier } from './types';

export interface CreateSupplierDto {
    name: string;
    contactName?: string;
    email?: string;
    phone?: string;
    address?: string;
    taxNumber?: string;
    taxOffice?: string;
    isActive?: boolean;
}

export type UpdateSupplierDto = Partial<CreateSupplierDto>;

class SuppliersService {
    async findAll(): Promise<Supplier[]> {
        const response = await axiosInstance.get('/suppliers');
        return response.data.data;
    }

    async findOne(id: string): Promise<Supplier> {
        const response = await axiosInstance.get(`/suppliers/${id}`);
        return response.data.data;
    }

    async create(data: CreateSupplierDto): Promise<Supplier> {
        const response = await axiosInstance.post('/suppliers', data);
        return response.data.data;
    }

    async update(id: string, data: UpdateSupplierDto): Promise<Supplier> {
        const response = await axiosInstance.put(`/suppliers/${id}`, data);
        return response.data.data;
    }

    async remove(id: string): Promise<void> {
        await axiosInstance.delete(`/suppliers/${id}`);
    }
}

export const suppliersService = new SuppliersService();
