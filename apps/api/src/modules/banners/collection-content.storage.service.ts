import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { COLLECTION_CONTENT_SETTING_KEY } from './banner.constants';
import { CollectionContentRecord } from './collection-content.types';

@Injectable()
export class CollectionContentStorageService {
  constructor(private readonly prisma: PrismaService) {}

  async getCollectionContents(): Promise<CollectionContentRecord[]> {
    const row = await this.prisma.setting.findUnique({
      where: { key: COLLECTION_CONTENT_SETTING_KEY },
      select: { value: true },
    });

    if (!row) {
      return [];
    }

    try {
      const parsed = JSON.parse(row.value) as CollectionContentRecord[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async saveCollectionContents(contents: CollectionContentRecord[]) {
    await this.prisma.setting.upsert({
      where: { key: COLLECTION_CONTENT_SETTING_KEY },
      create: {
        key: COLLECTION_CONTENT_SETTING_KEY,
        value: JSON.stringify(contents),
      },
      update: {
        value: JSON.stringify(contents),
      },
    });
  }
}
