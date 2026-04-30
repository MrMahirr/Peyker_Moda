import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ORDER_NOTES_SETTING_KEY } from './order-notes.constants';
import { OrderNoteRecord } from './order-notes.types';

@Injectable()
export class OrderNotesStorageService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotes(): Promise<OrderNoteRecord[]> {
    const row = await this.prisma.setting.findUnique({
      where: { key: ORDER_NOTES_SETTING_KEY },
      select: { value: true },
    });

    if (!row) {
      return [];
    }

    try {
      const parsed = JSON.parse(row.value) as OrderNoteRecord[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async saveNotes(notes: OrderNoteRecord[]) {
    await this.prisma.setting.upsert({
      where: { key: ORDER_NOTES_SETTING_KEY },
      create: {
        key: ORDER_NOTES_SETTING_KEY,
        value: JSON.stringify(notes),
      },
      update: {
        value: JSON.stringify(notes),
      },
    });
  }
}
