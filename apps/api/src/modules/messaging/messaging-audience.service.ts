import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  MessagingAudienceSummary,
  MessagingAudienceType,
  MessagingChannel,
} from './messaging.types';

@Injectable()
export class MessagingAudienceService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveAudience(
    channel: MessagingChannel,
    type = MessagingAudienceType.ALL_ACTIVE_CUSTOMERS,
  ): Promise<MessagingAudienceSummary> {
    const recipientCount = await this.prisma.customer.count({
      where: {
        isActive: true,
        ...(channel === MessagingChannel.EMAIL
          ? { email: { not: null } }
          : { phone: { not: null } }),
      },
    });

    return {
      type,
      recipientCount,
    };
  }
}
