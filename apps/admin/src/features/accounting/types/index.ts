export type CashRegisterType = 'CASH' | 'POS_TERMINAL' | 'BANK';

export interface CashRegister {
    id: string;
    name: string;
    type: CashRegisterType;
    balance: number;
    isActive: boolean;
    lastTransactionAt?: string;
    createdAt: string;
}

export interface BankAccount {
    id: string;
    bankName: string;
    accountName: string;
    iban: string;
    currency: string;
    balance: number;
    isActive: boolean;
    createdAt: string;
}

export type InvoiceType = 'SALE' | 'PURCHASE' | 'RETURN';
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED' | 'OVERDUE';

export interface Invoice {
    id: string;
    invoiceNumber: string;
    type: InvoiceType;
    status: InvoiceStatus;
    customerId?: string;
    customerName?: string;
    supplierId?: string;
    supplierName?: string;
    items: InvoiceItem[];
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    paidAmount: number;
    dueDate?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface InvoiceItem {
    productName: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
}

export interface CurrentAccount {
    id: string;
    type: 'CUSTOMER' | 'SUPPLIER';
    name: string;
    phone?: string;
    email?: string;
    totalDebt: number;
    totalCredit: number;
    balance: number;
    lastTransactionAt?: string;
}

export interface Check {
    id: string;
    type: 'RECEIVED' | 'GIVEN';
    checkNumber: string;
    bankName: string;
    amount: number;
    dueDate: string;
    status: 'PENDING' | 'DEPOSITED' | 'CASHED' | 'BOUNCED' | 'CANCELLED';
    customerName?: string;
    supplierName?: string;
    notes?: string;
    createdAt: string;
}

export interface Installment {
    id: string;
    orderId: string;
    orderNumber?: string;
    customerName: string;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    installmentCount: number;
    paidInstallments: number;
    nextDueDate?: string;
    status: 'ACTIVE' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
}

export interface DuePayment {
    id: string;
    type: 'RECEIVABLE' | 'PAYABLE';
    entityName: string;
    amount: number;
    dueDate: string;
    daysOverdue: number;
    invoiceNumber?: string;
    status: 'UPCOMING' | 'DUE_TODAY' | 'OVERDUE';
}

export interface VatReportLine {
    period: string;
    salesVat: number;
    purchaseVat: number;
    netVat: number;
}

export interface PeriodSummary {
    period: string;
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    taxPayable: number;
}
