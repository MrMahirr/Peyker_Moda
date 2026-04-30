import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PRICE_LISTS_SETTING_KEY } from './price-lists.constants';
import { PriceListRecord } from './price-lists.types';

@Injectable()
export class PriceListsStorageService {
  constructor(private readonly prisma: PrismaService) {}

  async getPriceLists(): Promise<PriceListRecord[]> {
    const row = await this.prisma.setting.findUnique({
      where: { key: PRICE_LISTS_SETTING_KEY },
      select: { value: true },
    });

    if (!row) {
      return [];
    }

    try {
      const parsed = JSON.parse(row.value) as PriceListRecord[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async savePriceLists(priceLists: PriceListRecord[]) {
    await this.prisma.setting.upsert({
      where: { key: PRICE_LISTS_SETTING_KEY },
      create: {
        key: PRICE_LISTS_SETTING_KEY,
        value: JSON.stringify(priceLists),
      },
      update: {
        value: JSON.stringify(priceLists),
      },
    });
  }
}
