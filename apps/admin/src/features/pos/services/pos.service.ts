import api from '../../../lib/axios';

export interface PosProduct {
    id: string;
    name: string;
    sku: string;
    barcode?: string;
    price: number;
    image?: string;
    stock: number;
    categoryName?: string;
}

export interface PosSession {
    id: string;
    status: 'OPEN' | 'CLOSED';
    openingCash: number;
    closingCash?: number;
    totalSales?: number;
    totalTransactions?: number;
    openedAt: string;
    closedAt?: string;
}

export interface CreateSaleDto {
    customerId?: string;
    items: {
        variantId: string;
        quantity: number;
        unitPrice: number;
    }[];
    paymentMethod: 'CASH' | 'CARD' | 'MIXED';
    cashAmount?: number;
    cardAmount?: number;
    discountAmount?: number;
    notes?: string;
}

export interface SaleResult {
    id: string;
    saleNumber: string;
    total: number;
    change?: number;
    receiptUrl?: string;
}

export const posService = {
    // Products
    async getProducts(search?: string, categoryId?: string): Promise<PosProduct[]> {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (categoryId) params.append('categoryId', categoryId);
        params.append('limit', '50');

        const response = await api.get(`/pos/products?${params}`);
        return response.data.data;
    },

    async getProductByBarcode(barcode: string): Promise<PosProduct | null> {
        try {
            const response = await api.get(`/pos/products/barcode/${barcode}`);
            return response.data.data;
        } catch {
            return null;
        }
    },

    // Sessions
    async getCurrentSession(): Promise<PosSession | null> {
        try {
            const response = await api.get('/pos/sessions/current');
            return response.data.data;
        } catch {
            return null;
        }
    },

    async openSession(openingCash: number): Promise<PosSession> {
        const response = await api.post('/pos/sessions/open', { openingCash });
        return response.data.data;
    },

    async closeSession(closingCash: number): Promise<PosSession> {
        const response = await api.post('/pos/sessions/close', { closingCash });
        return response.data.data;
    },

    // Sales
    async createSale(data: CreateSaleDto): Promise<SaleResult> {
        const response = await api.post('/pos/sale', data);
        return response.data;
    },

    async getSales(sessionId?: string) {
        const params = sessionId ? `?sessionId=${sessionId}` : '';
        const response = await api.get(`/pos/sales${params}`);
        return response.data.data;
    },

    // Categories for filtering
    async getCategories() {
        const response = await api.get('/categories?isActive=true');
        return response.data.data;
    }
};
