import api from '../../../lib/axios';

export interface DashboardSummary {
    todaySales: { count: number; amount: number };
    weekSales: { count: number; amount: number };
    monthSales: { count: number; amount: number };
    pendingOrders: number;
    totalCustomers: number;
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
    labels: string[];
    data: number[];
    totalAmount: number;
    averageAmount: number;
}

export const dashboardService = {
    async getSummary(startDate?: string, endDate?: string): Promise<DashboardSummary> {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const response = await api.get(`/dashboard/summary?${params}`);
        return response.data.data;
    },

    async getSalesChart(groupBy: 'day' | 'week' | 'month' = 'day'): Promise<SalesChartData> {
        const response = await api.get(`/dashboard/sales-chart?groupBy=${groupBy}`);
        return response.data.data;
    },

    async getTopProducts(limit = 10): Promise<TopProduct[]> {
        const response = await api.get(`/dashboard/top-products?limit=${limit}`);
        return response.data.data;
    },

    async getLowStock(threshold = 10, limit = 20): Promise<LowStockProduct[]> {
        const response = await api.get(`/dashboard/low-stock?threshold=${threshold}&limit=${limit}`);
        return response.data.data;
    },

    async getRecentOrders(limit = 10) {
        const response = await api.get(`/dashboard/recent-orders?limit=${limit}`);
        return response.data.data;
    },

    async getOrderStatusDistribution() {
        const response = await api.get('/dashboard/order-status');
        return response.data.data;
    }
};
