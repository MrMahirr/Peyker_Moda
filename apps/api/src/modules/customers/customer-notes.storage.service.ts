import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CUSTOMER_NOTES_SETTING_KEY } from './customer-notes.constants';
import { CustomerNoteRecord } from './customer-notes.types';

@Injectable()
export class CustomerNotesStorageService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotes(): Promise<CustomerNoteRecord[]> {
    const row = await this.prisma.setting.findUnique({
      where: { key: CUSTOMER_NOTES_SETTING_KEY },
      select: { value: true },
    });

    if (!row) {
      return [];
    }

    try {
      const parsed = JSON.parse(row.value) as CustomerNoteRecord[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async saveNotes(notes: CustomerNoteRecord[]) {
    await this.prisma.setting.upsert({
      where: { key: CUSTOMER_NOTES_SETTING_KEY },
      create: {
        key: CUSTOMER_NOTES_SETTING_KEY,
        value: JSON.stringify(notes),
      },
      update: {
        value: JSON.stringify(notes),
      },
    });
  }
}
