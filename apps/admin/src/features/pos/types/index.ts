export interface ParkSale {
    id: string;
    customerName?: string;
    items: {
        variantId: string;
        productName: string;
        variantName?: string;
        quantity: number;
        price: number;
        discount?: number;
    }[];
    totalAmount: number;
    notes?: string;
    parkedAt: string;
    userId: string;
}

export interface CashRegister {
    id: string;
    name: string;
    isActive: boolean;
    currentSessionId?: string;
    lastClosedAt?: string;
}

export interface QuickButton {
    id: string;
    variantId: string;
    productName: string;
    variantName?: string;
    price: number;
    image?: string;
    position: number;
}

export interface CashDrawerSummary {
    openingBalance: number;
    totalCash: number;
    totalCard: number;
    totalBankTransfer: number;
    totalSales: number;
    totalRefunds: number;
    expectedBalance: number;
    transactionCount: number;
}
