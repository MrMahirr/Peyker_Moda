export enum AccountingRegisterType {
  CASH = 'CASH',
  POS_TERMINAL = 'POS_TERMINAL',
  BANK = 'BANK',
}

export enum AccountingCheckType {
  RECEIVED = 'RECEIVED',
  GIVEN = 'GIVEN',
}

export enum AccountingCheckStatus {
  PENDING = 'PENDING',
  DEPOSITED = 'DEPOSITED',
  CASHED = 'CASHED',
  BOUNCED = 'BOUNCED',
  CANCELLED = 'CANCELLED',
}

export enum AccountingInstallmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum AccountingDuePaymentType {
  RECEIVABLE = 'RECEIVABLE',
  PAYABLE = 'PAYABLE',
}

export enum AccountingCurrentAccountType {
  CUSTOMER = 'CUSTOMER',
  SUPPLIER = 'SUPPLIER',
}

export enum AccountingDuePaymentStatus {
  UPCOMING = 'UPCOMING',
  DUE_TODAY = 'DUE_TODAY',
  OVERDUE = 'OVERDUE',
}

export interface AccountingRegister {
  id: string;
  name: string;
  type: AccountingRegisterType;
  balance: number;
  isActive: boolean;
  lastTransactionAt?: string;
  createdAt: string;
}

export interface AccountingBankAccount {
  id: string;
  bankName: string;
  accountName: string;
  iban: string;
  currency: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
}

export interface AccountingCheck {
  id: string;
  type: AccountingCheckType;
  checkNumber: string;
  bankName: string;
  amount: number;
  dueDate: string;
  status: AccountingCheckStatus;
  customerName?: string;
  supplierName?: string;
  notes?: string;
  createdAt: string;
}

export interface AccountingInstallment {
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
  status: AccountingInstallmentStatus;
}

export interface AccountingDuePayment {
  id: string;
  type: AccountingDuePaymentType;
  entityName: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  invoiceNumber?: string;
  status: AccountingDuePaymentStatus;
}

export interface AccountingPeriodSummary {
  period: string;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  taxPayable: number;
  isClosed?: boolean;
}

export interface AccountingCurrentAccount {
  id: string;
  type: AccountingCurrentAccountType;
  name: string;
  phone?: string;
  email?: string;
  totalDebt: number;
  totalCredit: number;
  balance: number;
  lastTransactionAt?: string;
}

export interface AccountingClosedPeriod {
  id: string;
  year: number;
  month: number;
  summary: AccountingPeriodSummary;
  closedAt: string;
  closedByUserId: string;
}

export interface ZReportSnapshot {
  date: string; // YYYY-MM-DD
  reportNo: string;
  closedAt: string;
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
