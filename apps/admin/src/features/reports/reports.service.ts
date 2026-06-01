import axiosInstance from '@/lib/axios';

export interface SalesStats {
    totalRevenue: number;
    netProfit: number;
    salesCount: number;
    returnRate: number;
    period: {
        startDate: string;
        endDate: string;
    };
    chartData?: {
        date: string;
        revenue: number;
        profit: number;
    }[];
}

export interface ProductPerformance {
    topProducts: { id: string; name: string; quantity: number; revenue: number }[];
    topCategories: { id: string; name: string; quantity: number; revenue: number }[];
}

export type ReportPeriod = 'this_month' | 'last_month' | 'last_3_months' | 'this_year';

class ReportsService {
    async getSalesStats(period: ReportPeriod = 'this_month'): Promise<SalesStats> {
        const response = await axiosInstance.get(`/reports/sales`, { params: { period } });
        return response.data;
    }

    async getProductPerformance(period: ReportPeriod = 'this_month'): Promise<ProductPerformance> {
        const response = await axiosInstance.get(`/reports/products/performance`, { params: { period } });
        return response.data;
    }
}

export const reportsService = new ReportsService();
