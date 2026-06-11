import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PAGE_HEADERS_SETTING_KEY } from './banner.constants';
import { PageHeaderRecord } from './page-header.types';

@Injectable()
export class PageHeaderStorageService {
  constructor(private readonly prisma: PrismaService) {}

  async getPageHeaders(): Promise<PageHeaderRecord[]> {
    const row = await this.prisma.setting.findUnique({
      where: { key: PAGE_HEADERS_SETTING_KEY },
      select: { value: true },
    });

    if (!row) {
      return [];
    }

    try {
      const parsed = JSON.parse(row.value) as PageHeaderRecord[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async savePageHeaders(headers: PageHeaderRecord[]) {
    await this.prisma.setting.upsert({
      where: { key: PAGE_HEADERS_SETTING_KEY },
      create: {
        key: PAGE_HEADERS_SETTING_KEY,
        value: JSON.stringify(headers),
      },
      update: {
        value: JSON.stringify(headers),
      },
    });
  }
}
