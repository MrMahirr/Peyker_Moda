import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { LoyaltyStorageService } from './loyalty-storage.service';
import { LoyaltyTier } from './loyalty.types';
import { CreateLoyaltyTierDto, UpdateLoyaltyTierDto } from './dto';

@Injectable()
export class LoyaltyTierService {
  constructor(private readonly storage: LoyaltyStorageService) {}

  async findAll() {
    const tiers = await this.storage.getTiers();
    return this.sortTiers(tiers);
  }

  async create(dto: CreateLoyaltyTierDto) {
    const tiers = await this.storage.getTiers();

    if (
      tiers.some((tier) => tier.name.toLowerCase() === dto.name.toLowerCase())
    ) {
      throw new ConflictException(
        'Bu isimde bir sadakat seviyesi zaten mevcut',
      );
    }

    const tier: LoyaltyTier = {
      id: randomUUID(),
      name: dto.name.trim(),
      minSpent: dto.minSpent,
      discountPercent: dto.discountPercent,
      pointMultiplier: dto.pointMultiplier,
      color: dto.color,
    };

    tiers.push(tier);
    await this.ensureTierThresholds(tiers);
    await this.storage.saveTiers(this.sortTiers(tiers));

    return tier;
  }

  async update(id: string, dto: UpdateLoyaltyTierDto) {
    const tiers = await this.storage.getTiers();
    const index = tiers.findIndex((tier) => tier.id === id);

    if (index === -1) {
      throw new NotFoundException('Sadakat seviyesi bulunamadi');
    }

    const nextName = dto.name?.trim();
    if (
      nextName &&
      tiers.some(
        (tier) =>
          tier.id !== id && tier.name.toLowerCase() === nextName.toLowerCase(),
      )
    ) {
      throw new ConflictException(
        'Bu isimde bir sadakat seviyesi zaten mevcut',
      );
    }

    const updatedTier: LoyaltyTier = {
      ...tiers[index],
      ...dto,
      name: nextName ?? tiers[index].name,
    };

    tiers[index] = updatedTier;
    await this.ensureTierThresholds(tiers);
    await this.storage.saveTiers(this.sortTiers(tiers));

    return updatedTier;
  }

  async remove(id: string) {
    const tiers = await this.storage.getTiers();

    if (tiers.length <= 1) {
      throw new BadRequestException('Son sadakat seviyesi silinemez');
    }

    const filtered = tiers.filter((tier) => tier.id !== id);

    if (filtered.length === tiers.length) {
      throw new NotFoundException('Sadakat seviyesi bulunamadi');
    }

    await this.storage.saveTiers(this.sortTiers(filtered));
    return { message: 'Sadakat seviyesi silindi' };
  }

  resolveTier(totalSpent: number, tiers: LoyaltyTier[]) {
    const sorted = this.sortTiers(tiers);

    return (
      [...sorted].reverse().find((tier) => totalSpent >= tier.minSpent) ??
      sorted[0]
    );
  }

  private sortTiers(tiers: LoyaltyTier[]) {
    return [...tiers].sort((left, right) => left.minSpent - right.minSpent);
  }

  private async ensureTierThresholds(tiers: LoyaltyTier[]) {
    const sorted = this.sortTiers(tiers);

    for (let index = 1; index < sorted.length; index += 1) {
      if (sorted[index].minSpent === sorted[index - 1].minSpent) {
        throw new ConflictException(
          'Ayni minimum harcama esigine sahip birden fazla seviye olamaz',
        );
      }
    }
  }
}
