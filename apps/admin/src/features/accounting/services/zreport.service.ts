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
    async getTodayReport(): Promise<ZReportData> {
        try {
            // Get current active session
            const sessionResponse = await api.get('/pos/sessions/current');
            const session = sessionResponse.data?.data;
            
            if (!session) {
                // If no active session, try to get dashboard summary as fallback
                return this.getFallbackReport();
            }

            const reportResponse = await api.get(`/pos/sessions/${session.id}/report`);
            const report = reportResponse.data?.data;

            const paymentsByMethod = report.paymentsByMethod || [];
            const cash = paymentsByMethod.find((p: any) => p.method === 'CASH')?.total || 0;
            const creditCard = paymentsByMethod.find((p: any) => p.method === 'CREDIT_CARD')?.total || 0;
            const other = paymentsByMethod.filter((p: any) => p.method !== 'CASH' && p.method !== 'CREDIT_CARD')
                .reduce((sum: number, p: any) => sum + p.total, 0);

            return {
                date: new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                reportNo: `Z-${session.id.slice(-8).toUpperCase()}`,
                summary: {
                    totalSales: report.session.totalSales || 0,
                    totalReturns: 0, // Returns are not explicitly tracked in POS session yet
                    netSales: report.session.totalSales || 0,
                    totalTax: (report.session.totalSales || 0) * 0.1, // Fixed 10% tax for display
                    transactionCount: report.session.totalTransactions || 0,
                },
                payments: {
                    cash,
                    creditCard,
                    other,
                },
                cashFlow: {
                    startBalance: Number(report.session.openingBalance) || 0,
                    cashIn: cash,
                    cashOut: 0,
                    safeBalance: (Number(report.session.openingBalance) || 0) + cash,
                }
            };
        } catch (error) {
            console.error('Z Report error:', error);
            return this.getFallbackReport();
        }
    },

    async getFallbackReport(): Promise<ZReportData> {
        // Fallback to dashboard summary if no session exists
        try {
            const response = await api.get('/dashboard/summary');
            const summary = response.data?.data;
            const today = summary?.todaySales || { count: 0, amount: 0 };
            
            return {
                date: new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                reportNo: `Z-${new Date().toISOString().split('T')[0].replace(/-/g, '')}`,
                summary: {
                    totalSales: today.amount,
                    totalReturns: 0,
                    netSales: today.amount,
                    totalTax: today.amount * 0.1,
                    transactionCount: today.count,
                },
                payments: {
                    cash: today.amount * 0.4, // Estimated
                    creditCard: today.amount * 0.6, // Estimated
                    other: 0,
                },
                cashFlow: {
                    startBalance: 0,
                    cashIn: today.amount * 0.4,
                    cashOut: 0,
                    safeBalance: today.amount * 0.4,
                }
            };
        } catch {
            // Return empty report
            return {
                date: new Date().toLocaleDateString('tr-TR'),
                reportNo: 'Z-UNKNOWN',
                summary: { totalSales: 0, totalReturns: 0, netSales: 0, totalTax: 0, transactionCount: 0 },
                payments: { cash: 0, creditCard: 0, other: 0 },
                cashFlow: { startBalance: 0, cashIn: 0, cashOut: 0, safeBalance: 0 }
            };
        }
    }
};
