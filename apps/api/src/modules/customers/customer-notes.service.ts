import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerNoteDto } from './dto';
import { CustomerNotesStorageService } from './customer-notes.storage.service';
import {
  CustomerNoteRecord,
  CustomerNoteResponse,
} from './customer-notes.types';
import { CustomersService } from './customers.service';

@Injectable()
export class CustomerNotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customersService: CustomersService,
    private readonly storage: CustomerNotesStorageService,
  ) {}

  async findAll(customerId: string): Promise<CustomerNoteResponse[]> {
    await this.customersService.findOne(customerId);

    const notes = await this.storage.getNotes();
    const customerNotes = notes
      .filter((note) => note.customerId === customerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return this.attachUserNames(customerNotes);
  }

  async create(
    customerId: string,
    dto: CreateCustomerNoteDto,
    userId: string,
  ): Promise<CustomerNoteResponse> {
    await this.customersService.findOne(customerId);

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

    const note: CustomerNoteRecord = {
      id: randomUUID(),
      customerId,
      content: dto.content.trim(),
      type: dto.type,
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
    notes: CustomerNoteRecord[],
  ): Promise<CustomerNoteResponse[]> {
    if (notes.length === 0) {
      return [];
    }

    const userIds = Array.from(new Set(notes.map((note) => note.userId)));
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
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
