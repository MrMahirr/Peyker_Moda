import api from '../../../lib/axios';

export interface DashboardSummary {
    todaySales: { count: number; amount: number };
    weekSales: { count: number; amount: number };
    monthSales: { count: number; amount: number };
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    totalCustomers: number;
    filteredCustomers: number;
    newCustomersThisWeek: number;
    lowStockCount: number;
    trends: {
        salesAmount: number;
        salesCount: number;
        newCustomers: number;
    };
}

export interface TopProduct {
    id: string;
    name: string;
    sku: string;
    totalQuantity: number;
    totalRevenue: number;
    orderCount: number;
}

export interface LowStockProduct {
    id: string;
    productId: string;
    productName: string;
    sku: string;
    size: string;
    color: string;
    stock: number;
}

export interface SalesChartData {
    date: string;
    count: number;
    amount: number;
}

export const dashboardService = {
    async getSummary(startDate?: string, endDate?: string): Promise<DashboardSummary> {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const response = await api.get(`/dashboard/summary?${params}`);
        return response.data.data;
    },

    async getSalesChart(groupBy: 'day' | 'week' | 'month' = 'day', startDate?: string, endDate?: string): Promise<SalesChartData[]> {
        const params = new URLSearchParams();
        params.append('groupBy', groupBy);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const response = await api.get(`/dashboard/sales-chart?${params.toString()}`);
        return response.data.data;
    },

    async getTopProducts(limit = 10, startDate?: string, endDate?: string): Promise<TopProduct[]> {
        const params = new URLSearchParams();
        params.append('limit', String(limit));
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const response = await api.get(`/dashboard/top-products?${params.toString()}`);
        return response.data.data;
    },

    async getLowStock(threshold = 10, limit = 20): Promise<LowStockProduct[]> {
        const response = await api.get(`/dashboard/low-stock?threshold=${threshold}&limit=${limit}`);
        return response.data.data.map((item: any) => ({
            id: item.variant?.id || '',
            productId: item.product?.id || '',
            productName: item.product?.name || 'Bilinmeyen Ürün',
            sku: item.variant?.sku || item.product?.sku || '',
            size: item.variant?.size || '',
            color: item.variant?.color || '',
            stock: item.stock || 0,
        }));
    },

    async getRecentOrders(limit = 10, startDate?: string, endDate?: string) {
        const params = new URLSearchParams();
        params.append('limit', String(limit));
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const response = await api.get(`/dashboard/recent-orders?${params.toString()}`);
        return response.data.data;
    },

    async getOrderStatusDistribution() {
        const response = await api.get('/dashboard/order-status');
        return response.data.data;
    },

    async globalSearch(q: string) {
        const response = await api.get(`/dashboard/search?q=${encodeURIComponent(q)}`);
        return response.data.data;
    }
};
