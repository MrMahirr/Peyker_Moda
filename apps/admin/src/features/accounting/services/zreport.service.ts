import api from '../../../lib/axios';

export interface ZReportData {
    date: string;
    reportNo: string;
    summary: {
        totalSales: number;
        totalReturns: number;
        netSales: number;
        totalTax: number;
        transactionCount: number;
    };
    payments: {
        cash: number;
        creditCard: number;
        other: number;
    };
    cashFlow: {
        startBalance: number;
        cashIn: number;
        cashOut: number;
        safeBalance: number;
    };
}

export const zReportService = {
    async getTodayReport(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<ZReportData> {
        try {
            const response = await api.get(`/accounting/reports/z-report?period=${period}`);
            return response.data.data || response.data; // Depending on nestjs interceptor
        } catch (error) {
            console.error('Z Report error:', error);
            // Hata durumunda en azından boş bir rapor dönsün ki sayfa çökmesin
            return {
                date: new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                reportNo: 'Z-UNKNOWN',
                summary: { totalSales: 0, totalReturns: 0, netSales: 0, totalTax: 0, transactionCount: 0 },
                payments: { cash: 0, creditCard: 0, other: 0 },
                cashFlow: { startBalance: 0, cashIn: 0, cashOut: 0, safeBalance: 0 }
            };
        }
    },
    
    async closeDay(): Promise<ZReportData> {
        const response = await api.post('/accounting/reports/z-report/close');
        return response.data.data || response.data;
    }
};
