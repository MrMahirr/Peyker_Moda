import {
  AccountingCheckStatus,
  AccountingRegister,
  AccountingRegisterType,
} from './accounting.types';

export const ACCOUNTING_STORAGE_KEYS = {
  REGISTERS: 'accounting.registers',
  BANK_ACCOUNTS: 'accounting.bankAccounts',
  CHECKS: 'accounting.checks',
  CLOSED_PERIODS: 'accounting.closedPeriods',
} as const;

export const DEFAULT_ACCOUNTING_REGISTERS: AccountingRegister[] = [
  {
    id: 'register-cash-main',
    name: 'Ana Nakit Kasa',
    type: AccountingRegisterType.CASH,
    balance: 0,
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
  },
  {
    id: 'register-pos-main',
    name: 'Ana POS Terminali',
    type: AccountingRegisterType.POS_TERMINAL,
    balance: 0,
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
  },
  {
    id: 'register-bank-main',
    name: 'Banka Tahsilat Hesabi',
    type: AccountingRegisterType.BANK,
    balance: 0,
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
  },
];

export const OPEN_CHECK_STATUSES: AccountingCheckStatus[] = [
  AccountingCheckStatus.PENDING,
  AccountingCheckStatus.DEPOSITED,
];

export const DEFAULT_TAX_RATE = 18;
