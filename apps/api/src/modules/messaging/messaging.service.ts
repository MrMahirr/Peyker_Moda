import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBulkMessageDto } from './dto';
import { MessagingAudienceService } from './messaging-audience.service';
import { MessagingProviderRegistryService } from './messaging-provider-registry.service';
import { MessagingStorageService } from './messaging-storage.service';
import {
  BulkMessageRecord,
  BulkMessageResponse,
  BulkMessageStatus,
  MessagingAudienceType,
} from './messaging.types';

@Injectable()
export class MessagingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audienceService: MessagingAudienceService,
    private readonly providerRegistry: MessagingProviderRegistryService,
    private readonly storage: MessagingStorageService,
  ) {}

  getChannelStatuses() {
    return this.providerRegistry.getCapabilities();
  }

  async getBulkMessages(): Promise<BulkMessageResponse[]> {
    const messages = await this.storage.getBulkMessages();
    return this.attachRequestedByNames(messages);
  }

  async createBulkMessage(
    dto: CreateBulkMessageDto,
    userId: string,
  ): Promise<BulkMessageResponse> {
    const [messages, capability, audience] = await Promise.all([
      this.storage.getBulkMessages(),
      Promise.resolve(this.providerRegistry.getCapability(dto.channel)),
      this.audienceService.resolveAudience(
        dto.channel,
        dto.audienceType ?? MessagingAudienceType.ALL_ACTIVE_CUSTOMERS,
      ),
    ]);

    const message: BulkMessageRecord = {
      id: randomUUID(),
      channel: dto.channel,
      title: dto.title.trim(),
      content: dto.content.trim(),
      audience,
      status: capability?.available
        ? BulkMessageStatus.QUEUED
        : BulkMessageStatus.PENDING_PROVIDER,
      providerReason:
        capability?.reason ?? 'Mesaj provider durumu tanimli degil',
      requestedByUserId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    messages.unshift(message);
    await this.storage.saveBulkMessages(messages);

    // Simulate Native Queue Processing
    if (message.status === BulkMessageStatus.QUEUED) {
      setTimeout(async () => {
        try {
          const currentMessages = await this.storage.getBulkMessages();
          const target = currentMessages.find((m) => m.id === message.id);
          if (target) {
            target.status = BulkMessageStatus.SENT;
            target.providerReason = 'Başarıyla iletildi (Native Queue)';
            target.updatedAt = new Date().toISOString();
            await this.storage.saveBulkMessages(currentMessages);
          }
        } catch (err) {
          console.error('Queue processing error', err);
        }
      }, 5000); // 5 seconds processing delay
    }

    const [user] = await this.prisma.user.findMany({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
      },
      take: 1,
    });

    return {
      ...message,
      requestedByName: user
        ? `${user.firstName} ${user.lastName}`.trim()
        : undefined,
    };
  }

  private async attachRequestedByNames(
    messages: BulkMessageRecord[],
  ): Promise<BulkMessageResponse[]> {
    if (messages.length === 0) {
      return [];
    }

    const userIds = Array.from(
      new Set(messages.map((message) => message.requestedByUserId)),
    );
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

    return messages.map((message) => ({
      ...message,
      requestedByName: userMap.get(message.requestedByUserId),
    }));
  }
}
