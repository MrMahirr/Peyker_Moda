import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ACCOUNTING_STORAGE_KEYS,
  DEFAULT_ACCOUNTING_REGISTERS,
} from './accounting.constants';
import {
  AccountingBankAccount,
  AccountingCheck,
  AccountingClosedPeriod,
  AccountingCurrentAccount,
  AccountingDuePayment,
  AccountingRegister,
  ZReportSnapshot,
} from './accounting.types';

@Injectable()
export class AccountingStorageService {
  constructor(private readonly prisma: PrismaService) {}

  async getRegisters(): Promise<AccountingRegister[]> {
    return this.readJsonSetting(
      ACCOUNTING_STORAGE_KEYS.REGISTERS,
      DEFAULT_ACCOUNTING_REGISTERS,
    );
  }

  async saveRegisters(registers: AccountingRegister[]) {
    await this.writeJsonSetting(ACCOUNTING_STORAGE_KEYS.REGISTERS, registers);
  }

  async getBankAccounts(): Promise<AccountingBankAccount[]> {
    return this.readJsonSetting(ACCOUNTING_STORAGE_KEYS.BANK_ACCOUNTS, []);
  }

  async saveBankAccounts(accounts: AccountingBankAccount[]) {
    await this.writeJsonSetting(ACCOUNTING_STORAGE_KEYS.BANK_ACCOUNTS, accounts);
  }

  async getChecks(): Promise<AccountingCheck[]> {
    return this.readJsonSetting(ACCOUNTING_STORAGE_KEYS.CHECKS, []);
  }

  async saveChecks(checks: AccountingCheck[]) {
    await this.writeJsonSetting(ACCOUNTING_STORAGE_KEYS.CHECKS, checks);
  }

  async getClosedPeriods(): Promise<AccountingClosedPeriod[]> {
    return this.readJsonSetting(ACCOUNTING_STORAGE_KEYS.CLOSED_PERIODS, []);
  }

  async saveClosedPeriods(periods: AccountingClosedPeriod[]) {
    await this.writeJsonSetting(ACCOUNTING_STORAGE_KEYS.CLOSED_PERIODS, periods);
  }

  async getZReportSnapshots(): Promise<ZReportSnapshot[]> {
    return this.readJsonSetting(ACCOUNTING_STORAGE_KEYS.CLOSED_DAYS, []);
  }

  async saveZReportSnapshots(snapshots: ZReportSnapshot[]) {
    await this.writeJsonSetting(ACCOUNTING_STORAGE_KEYS.CLOSED_DAYS, snapshots);
  }

  private async readJsonSetting<T>(key: string, fallback: T): Promise<T> {
    const row = await this.prisma.setting.findUnique({ where: { key } });

    if (!row) {
      return this.cloneValue(fallback);
    }

    try {
      return JSON.parse(row.value) as T;
    } catch {
      return this.cloneValue(fallback);
    }
  }

  private async writeJsonSetting(key: string, value: unknown) {
    await this.prisma.setting.upsert({
      where: { key },
      create: {
        key,
        value: JSON.stringify(value),
      },
      update: {
        value: JSON.stringify(value),
      },
    });
  }

  private cloneValue<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }
}
