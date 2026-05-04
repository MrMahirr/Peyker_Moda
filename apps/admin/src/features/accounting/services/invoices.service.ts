import api from '../../../lib/axios';

export interface Invoice {
    id: string;
    invoiceNumber: string;
    type: 'SALES' | 'PURCHASE';
    customerId?: string;
    customer?: {
        firstName: string;
        lastName: string;
        phone: string;
    };
    orderId?: string;
    subtotal: number;
    tax: number;
    total: number;
    status: 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED';
    dueDate?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface InvoiceQueryParams {
    page?: number;
    limit?: number;
    type?: 'SALES' | 'PURCHASE';
    status?: string;
    startDate?: string;
    endDate?: string;
}

export const invoicesService = {
    async getAll(params?: InvoiceQueryParams): Promise<Invoice[]> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', String(params.page));
        if (params?.limit) queryParams.append('limit', String(params.limit));
        if (params?.type) queryParams.append('type', params.type);
        if (params?.status) queryParams.append('status', params.status);

        const response = await api.get(`/invoices?${queryParams}`);
        return response.data.data;
    },

    async getById(id: string): Promise<Invoice> {
        const response = await api.get(`/invoices/${id}`);
        return response.data.data;
    },

    async downloadPdf(id: string): Promise<Blob> {
        const response = await api.get(`/invoices/${id}/pdf`, {
            responseType: 'blob'
        });
        return response.data;
    },

    async markAsPaid(id: string): Promise<Invoice> {
        const response = await api.patch(`/invoices/${id}`, { status: 'PAID' });
        return response.data.data;
    },

    async create(data: Partial<Invoice>): Promise<Invoice> {
        const response = await api.post('/invoices', data);
        return response.data.data;
    },

    async cancel(id: string): Promise<Invoice> {
        const response = await api.patch(`/invoices/${id}`, { status: 'CANCELLED' });
        return response.data.data;
    }
};

// Helper function to trigger PDF download
export const downloadInvoicePdf = async (invoiceId: string, invoiceNumber: string) => {
    try {
        const blob = await invoicesService.downloadPdf(invoiceId);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${invoiceNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('PDF download error:', error);
        throw error;
    }
};
