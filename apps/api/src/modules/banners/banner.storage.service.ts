import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BANNERS_SETTING_KEY } from './banner.constants';
import { BannerRecord } from './banner.types';

@Injectable()
export class BannerStorageService {
  constructor(private readonly prisma: PrismaService) {}

  async getBanners(): Promise<BannerRecord[]> {
    const row = await this.prisma.setting.findUnique({
      where: { key: BANNERS_SETTING_KEY },
      select: { value: true },
    });

    if (!row) {
      return [];
    }

    try {
      const parsed = JSON.parse(row.value) as BannerRecord[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async saveBanners(banners: BannerRecord[]) {
    await this.prisma.setting.upsert({
      where: { key: BANNERS_SETTING_KEY },
      create: {
        key: BANNERS_SETTING_KEY,
        value: JSON.stringify(banners),
      },
      update: {
        value: JSON.stringify(banners),
      },
    });
  }
}
