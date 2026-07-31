import api from '../../../lib/axios';
import type { CashRegister, BankAccount, Check, Installment, DuePayment } from '../types';

export const cashService = {
    // ── Cash Registers ──
    async getRegisters(): Promise<CashRegister[]> {
        const response = await api.get('/accounting/registers');
        return response.data.data;
    },

    async createRegister(data: Partial<CashRegister>): Promise<CashRegister> {
        const response = await api.post('/accounting/registers', data);
        return response.data.data;
    },

    async updateRegister(id: string, data: Partial<CashRegister>): Promise<CashRegister> {
        const response = await api.patch(`/accounting/registers/${id}`, data);
        return response.data.data;
    },

    // ── Bank Accounts ──
    async getBankAccounts(): Promise<BankAccount[]> {
        const response = await api.get('/accounting/bank-accounts');
        return response.data.data;
    },

    async createBankAccount(data: Partial<BankAccount>): Promise<BankAccount> {
        const response = await api.post('/accounting/bank-accounts', data);
        return response.data.data;
    },

    async updateBankAccount(id: string, data: Partial<BankAccount>): Promise<BankAccount> {
        const response = await api.patch(`/accounting/bank-accounts/${id}`, data);
        return response.data.data;
    },

    async deleteBankAccount(id: string): Promise<void> {
        await api.delete(`/accounting/bank-accounts/${id}`);
    },

    // ── Checks ──
    async getChecks(type?: 'RECEIVED' | 'GIVEN'): Promise<Check[]> {
        const params = type ? `?type=${type}` : '';
        const response = await api.get(`/accounting/checks${params}`);
        return response.data.data;
    },

    async createCheck(data: Partial<Check>): Promise<Check> {
        const response = await api.post('/accounting/checks', data);
        return response.data.data;
    },

    async updateCheckStatus(id: string, status: Check['status']): Promise<Check> {
        const response = await api.patch(`/accounting/checks/${id}/status`, { status });
        return response.data.data;
    },

    // ── Installments ──
    async getInstallments(): Promise<Installment[]> {
        const response = await api.get('/accounting/installments');
        return response.data.data;
    },

    async recordInstallmentPayment(id: string, amount: number): Promise<Installment> {
        const response = await api.post(`/accounting/installments/${id}/pay`, { amount });
        return response.data.data;
    },

    // ── Due Payments ──
    async getDuePayments(type?: 'RECEIVABLE' | 'PAYABLE'): Promise<DuePayment[]> {
        const params = type ? `?type=${type}` : '';
        const response = await api.get(`/accounting/due-payments${params}`);
        return response.data.data;
    },

    // ── VAT Report ──
    async getVatReport(year: number): Promise<{ lines: { period: string; salesVat: number; purchaseVat: number; netVat: number }[] }> {
        const response = await api.get(`/accounting/reports/vat?year=${year}`);
        return response.data.data;
    },

    // ── Period Closing ──
    async getPeriodSummary(year: number, month: number): Promise<{ totalIncome: number; totalExpense: number; netProfit: number; taxPayable: number }> {
        const response = await api.get(`/accounting/reports/period?year=${year}&month=${month}`);
        return response.data.data;
    },

    async closePeriod(year: number, month: number): Promise<void> {
        await api.post('/accounting/reports/close-period', { year, month });
    },
};
