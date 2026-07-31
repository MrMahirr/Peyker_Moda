import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  DEFAULT_LOYALTY_TIERS,
  LOYALTY_STORAGE_KEYS,
} from './loyalty.constants';
import { LoyaltyCustomerRecord, LoyaltyTier } from './loyalty.types';

@Injectable()
export class LoyaltyStorageService {
  constructor(private readonly prisma: PrismaService) {}

  async getTiers(): Promise<LoyaltyTier[]> {
    return this.readJsonSetting(
      LOYALTY_STORAGE_KEYS.TIERS,
      DEFAULT_LOYALTY_TIERS,
    );
  }

  async saveTiers(tiers: LoyaltyTier[]) {
    await this.writeJsonSetting(LOYALTY_STORAGE_KEYS.TIERS, tiers);
  }

  async getCustomerRecords(): Promise<LoyaltyCustomerRecord[]> {
    return this.readJsonSetting(LOYALTY_STORAGE_KEYS.CUSTOMERS, []);
  }

  async saveCustomerRecords(records: LoyaltyCustomerRecord[]) {
    await this.writeJsonSetting(LOYALTY_STORAGE_KEYS.CUSTOMERS, records);
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
      create: { key, value: JSON.stringify(value) },
      update: { value: JSON.stringify(value) },
    });
  }

  private cloneValue<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }
}
