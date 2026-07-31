import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CustomersService } from '../customers/customers.service';
import { AddLoyaltyPointsDto } from './dto';
import { LoyaltyStorageService } from './loyalty-storage.service';
import { LoyaltyTierService } from './loyalty-tier.service';
import { LoyaltyCustomerRecord, LoyaltyPoints } from './loyalty.types';

@Injectable()
export class LoyaltyPointsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customersService: CustomersService,
    private readonly storage: LoyaltyStorageService,
    private readonly tierService: LoyaltyTierService,
  ) {}

  async getCustomerPoints(customerId: string): Promise<LoyaltyPoints> {
    await this.customersService.findOne(customerId);

    const [records, tiers, orderStats] = await Promise.all([
      this.storage.getCustomerRecords(),
      this.storage.getTiers(),
      this.prisma.order.aggregate({
        where: {
          customerId,
          status: {
            not: OrderStatus.CANCELLED,
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),
    ]);

    const record = this.getOrCreateRecord(customerId, records);
    const totalSpent = Number(orderStats._sum.totalAmount ?? 0);
    const tier = this.tierService.resolveTier(totalSpent, tiers);

    return {
      customerId,
      currentPoints: record.currentPoints,
      totalEarned: record.totalEarned,
      totalSpent: Number(totalSpent.toFixed(2)),
      tier,
    };
  }

  async addPoints(
    customerId: string,
    dto: AddLoyaltyPointsDto,
    userId: string,
  ) {
    await this.customersService.findOne(customerId);

    const records = await this.storage.getCustomerRecords();
    const record = this.getOrCreateRecord(customerId, records);

    record.currentPoints += dto.points;
    record.totalEarned += dto.points;
    record.adjustments.unshift({
      id: randomUUID(),
      points: dto.points,
      reason: dto.reason.trim(),
      createdAt: new Date().toISOString(),
      userId,
    });

    await this.storage.saveCustomerRecords(records);

    return this.getCustomerPoints(customerId);
  }

  private getOrCreateRecord(
    customerId: string,
    records: LoyaltyCustomerRecord[],
  ) {
    let record = records.find((item) => item.customerId === customerId);

    if (!record) {
      record = {
        customerId,
        currentPoints: 0,
        totalEarned: 0,
        adjustments: [],
      };
      records.push(record);
    }

    return record;
  }
}
