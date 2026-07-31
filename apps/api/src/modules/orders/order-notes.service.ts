import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderNoteDto } from './dto';
import { OrderNotesStorageService } from './order-notes.storage.service';
import { OrderNoteRecord, OrderNoteResponse } from './order-notes.types';
import { OrdersService } from './orders.service';

@Injectable()
export class OrderNotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
    private readonly storage: OrderNotesStorageService,
  ) {}

  async findAll(orderId: string): Promise<OrderNoteResponse[]> {
    await this.ordersService.findOne(orderId);

    const notes = await this.storage.getNotes();
    const orderNotes = notes
      .filter((note) => note.orderId === orderId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return this.attachUserNames(orderNotes);
  }

  async create(
    orderId: string,
    dto: CreateOrderNoteDto,
    userId: string,
  ): Promise<OrderNoteResponse> {
    await this.ordersService.findOne(orderId);

    const [notes, user] = await Promise.all([
      this.storage.getNotes(),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          firstName: true,
          lastName: true,
        },
      }),
    ]);

    if (!user) {
      throw new NotFoundException('Kullanici bulunamadi');
    }

    const note: OrderNoteRecord = {
      id: randomUUID(),
      orderId,
      content: dto.content.trim(),
      isInternal: dto.isInternal ?? true,
      userId,
      createdAt: new Date().toISOString(),
    };

    notes.push(note);
    await this.storage.saveNotes(notes);

    return {
      ...note,
      userName: `${user.firstName} ${user.lastName}`.trim(),
    };
  }

  private async attachUserNames(
    notes: OrderNoteRecord[],
  ): Promise<OrderNoteResponse[]> {
    if (notes.length === 0) {
      return [];
    }

    const userIds = Array.from(new Set(notes.map((note) => note.userId)));
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    const userMap = new Map(
      users.map((user) => [
        user.id,
        `${user.firstName} ${user.lastName}`.trim() || undefined,
      ]),
    );

    return notes.map((note) => ({
      ...note,
      userName: userMap.get(note.userId),
    }));
  }
}
