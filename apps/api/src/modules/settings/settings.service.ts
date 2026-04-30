import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSettingsDto } from './dto';

const SETTING_KEYS = [
  'storeName',
  'storeAddress',
  'storePhone',
  'storeEmail',
  'currency',
  'taxRate',
  'lowStockThreshold',
  'receiptHeader',
  'receiptFooter',
  'receiptAddress',
  'receiptPhone',
  'receiptTaxRate',
  'receiptShowLogo',
] as const;

const DEFAULT_SETTINGS = {
  storeName: 'Peyker Moda',
  storeAddress: 'Istanbul, Turkiye',
  storePhone: '+90 555 123 4567',
  storeEmail: 'info@peykermoda.com',
  currency: 'TRY',
  taxRate: 18,
  lowStockThreshold: 10,
  receiptHeader: 'Peyker Moda',
  receiptFooter: 'Tesekkur ederiz, yine bekleriz.',
  receiptAddress: 'Istanbul, Turkiye',
  receiptPhone: '+90 555 123 4567',
  receiptTaxRate: 18,
  receiptShowLogo: true,
};

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  private parseNumber(value: string | undefined, fallback: number) {
    const num = value !== undefined ? Number(value) : NaN;
    return Number.isFinite(num) ? num : fallback;
  }

  private parseBoolean(value: string | undefined, fallback: boolean) {
    if (value === undefined) return fallback;
    return value === 'true' || value === '1';
  }

  async getSettings() {
    const rows = await this.prisma.setting.findMany({
      where: { key: { in: SETTING_KEYS as unknown as string[] } },
    });

    const map = new Map(rows.map((r) => [r.key, r]));
    const now = new Date();
    const createdAt = rows.length
      ? rows.reduce((min, r) => (r.createdAt < min ? r.createdAt : min), rows[0].createdAt)
      : now;
    const updatedAt = rows.length
      ? rows.reduce((max, r) => (r.updatedAt > max ? r.updatedAt : max), rows[0].updatedAt)
      : now;

    return {
      id: 'default',
      storeName: map.get('storeName')?.value ?? DEFAULT_SETTINGS.storeName,
      storeAddress: map.get('storeAddress')?.value ?? DEFAULT_SETTINGS.storeAddress,
      storePhone: map.get('storePhone')?.value ?? DEFAULT_SETTINGS.storePhone,
      storeEmail: map.get('storeEmail')?.value ?? DEFAULT_SETTINGS.storeEmail,
      currency: map.get('currency')?.value ?? DEFAULT_SETTINGS.currency,
      taxRate: this.parseNumber(map.get('taxRate')?.value, DEFAULT_SETTINGS.taxRate),
      lowStockThreshold: this.parseNumber(
        map.get('lowStockThreshold')?.value,
        DEFAULT_SETTINGS.lowStockThreshold,
      ),
      receiptHeader: map.get('receiptHeader')?.value ?? DEFAULT_SETTINGS.receiptHeader,
      receiptFooter: map.get('receiptFooter')?.value ?? DEFAULT_SETTINGS.receiptFooter,
      receiptAddress: map.get('receiptAddress')?.value ?? DEFAULT_SETTINGS.receiptAddress,
      receiptPhone: map.get('receiptPhone')?.value ?? DEFAULT_SETTINGS.receiptPhone,
      receiptTaxRate: this.parseNumber(
        map.get('receiptTaxRate')?.value,
        DEFAULT_SETTINGS.receiptTaxRate,
      ),
      receiptShowLogo: this.parseBoolean(
        map.get('receiptShowLogo')?.value,
        DEFAULT_SETTINGS.receiptShowLogo,
      ),
      createdAt,
      updatedAt,
    };
  }

  async updateSettings(dto: UpdateSettingsDto) {
    const entries: Array<[string, string]> = [];

    if (dto.storeName !== undefined) entries.push(['storeName', dto.storeName]);
    if (dto.storeAddress !== undefined) entries.push(['storeAddress', dto.storeAddress]);
    if (dto.storePhone !== undefined) entries.push(['storePhone', dto.storePhone]);
    if (dto.storeEmail !== undefined) entries.push(['storeEmail', dto.storeEmail]);
    if (dto.currency !== undefined) entries.push(['currency', dto.currency]);
    if (dto.taxRate !== undefined) entries.push(['taxRate', String(dto.taxRate)]);
    if (dto.lowStockThreshold !== undefined) entries.push(['lowStockThreshold', String(dto.lowStockThreshold)]);
    if (dto.receiptHeader !== undefined) entries.push(['receiptHeader', dto.receiptHeader]);
    if (dto.receiptFooter !== undefined) entries.push(['receiptFooter', dto.receiptFooter]);
    if (dto.receiptAddress !== undefined) entries.push(['receiptAddress', dto.receiptAddress]);
    if (dto.receiptPhone !== undefined) entries.push(['receiptPhone', dto.receiptPhone]);
    if (dto.receiptTaxRate !== undefined) entries.push(['receiptTaxRate', String(dto.receiptTaxRate)]);
    if (dto.receiptShowLogo !== undefined) entries.push(['receiptShowLogo', String(dto.receiptShowLogo)]);

    await Promise.all(
      entries.map(([key, value]) =>
        this.prisma.setting.upsert({
          where: { key },
          create: { key, value },
          update: { value },
        }),
      ),
    );

    return this.getSettings();
  }
}
