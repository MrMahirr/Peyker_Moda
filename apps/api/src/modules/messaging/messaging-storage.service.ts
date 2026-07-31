import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BULK_MESSAGES_SETTING_KEY } from './messaging.constants';
import { BulkMessageRecord } from './messaging.types';

@Injectable()
export class MessagingStorageService {
  constructor(private readonly prisma: PrismaService) {}

  async getBulkMessages(): Promise<BulkMessageRecord[]> {
    const row = await this.prisma.setting.findUnique({
      where: { key: BULK_MESSAGES_SETTING_KEY },
      select: { value: true },
    });

    if (!row) {
      return [];
    }

    try {
      const parsed = JSON.parse(row.value) as BulkMessageRecord[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async saveBulkMessages(messages: BulkMessageRecord[]) {
    await this.prisma.setting.upsert({
      where: { key: BULK_MESSAGES_SETTING_KEY },
      create: {
        key: BULK_MESSAGES_SETTING_KEY,
        value: JSON.stringify(messages),
      },
      update: {
        value: JSON.stringify(messages),
      },
    });
  }
}
