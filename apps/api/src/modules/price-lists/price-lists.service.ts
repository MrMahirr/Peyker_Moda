import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreatePriceListDto, UpdatePriceListDto } from './dto';
import { PriceListsReferenceService } from './price-lists-reference.service';
import { PriceListsStorageService } from './price-lists-storage.service';
import {
  PriceListAdjustmentType,
  PriceListEffectiveStatus,
  PriceListRecord,
  PriceListResponse,
  PriceListScopeType,
} from './price-lists.types';

@Injectable()
export class PriceListsService {
  constructor(
    private readonly storage: PriceListsStorageService,
    private readonly references: PriceListsReferenceService,
  ) {}

  async findAll(): Promise<PriceListResponse[]> {
    const priceLists = await this.storage.getPriceLists();
    return Promise.all(
      this.sortPriceLists(priceLists).map((priceList) =>
        this.enrichPriceList(priceList),
      ),
    );
  }

  async getMetadata() {
    return this.references.getMetadata();
  }

  async create(dto: CreatePriceListDto): Promise<PriceListResponse> {
    const priceLists = await this.storage.getPriceLists();
    const normalizedDto = this.normalizeCreateDto(dto);

    if (
      priceLists.some(
        (priceList) =>
          priceList.name.toLowerCase() === normalizedDto.name.toLowerCase(),
      )
    ) {
      throw new ConflictException('Bu isimde bir fiyat listesi zaten mevcut');
    }

    await this.references.resolveReferences({
      customerGroupId: normalizedDto.customerGroupId,
      scopeType: normalizedDto.scopeType,
      categoryId: normalizedDto.categoryId,
      productId: normalizedDto.productId,
      adjustmentType: normalizedDto.adjustmentType,
      amount: normalizedDto.amount,
      startsAt: normalizedDto.startsAt,
      endsAt: normalizedDto.endsAt,
    });

    const now = new Date().toISOString();
    const record: PriceListRecord = {
      id: randomUUID(),
      name: normalizedDto.name,
      description: normalizedDto.description,
      customerGroupId: normalizedDto.customerGroupId,
      scopeType: normalizedDto.scopeType,
      categoryId: normalizedDto.categoryId,
      productId: normalizedDto.productId,
      adjustmentType: normalizedDto.adjustmentType,
      amount: normalizedDto.amount,
      currency: 'TRY',
      priority: normalizedDto.priority ?? this.getNextPriority(priceLists),
      isActive: normalizedDto.isActive ?? true,
      startsAt: normalizedDto.startsAt,
      endsAt: normalizedDto.endsAt,
      createdAt: now,
      updatedAt: now,
    };

    priceLists.push(record);
    const normalized = this.normalizePriorities(priceLists);
    await this.storage.savePriceLists(normalized);

    return this.enrichPriceList(
      normalized.find((item) => item.id === record.id) as PriceListRecord,
    );
  }

  async update(
    id: string,
    dto: UpdatePriceListDto,
  ): Promise<PriceListResponse> {
    const priceLists = await this.storage.getPriceLists();
    const index = priceLists.findIndex((priceList) => priceList.id === id);

    if (index === -1) {
      throw new NotFoundException('Fiyat listesi bulunamadi');
    }

    const current = priceLists[index];
    const merged = this.mergePriceList(current, dto);

    if (
      priceLists.some(
        (priceList) =>
          priceList.id !== id &&
          priceList.name.toLowerCase() === merged.name.toLowerCase(),
      )
    ) {
      throw new ConflictException('Bu isimde bir fiyat listesi zaten mevcut');
    }

    await this.references.resolveReferences({
      customerGroupId: merged.customerGroupId,
      scopeType: merged.scopeType,
      categoryId: merged.categoryId,
      productId: merged.productId,
      adjustmentType: merged.adjustmentType,
      amount: merged.amount,
      startsAt: merged.startsAt,
      endsAt: merged.endsAt,
    });

    priceLists[index] = merged;
    const normalized = this.normalizePriorities(priceLists);
    await this.storage.savePriceLists(normalized);

    return this.enrichPriceList(
      normalized.find((item) => item.id === id) as PriceListRecord,
    );
  }

  async remove(id: string) {
    const priceLists = await this.storage.getPriceLists();
    const filtered = priceLists.filter((priceList) => priceList.id !== id);

    if (filtered.length === priceLists.length) {
      throw new NotFoundException('Fiyat listesi bulunamadi');
    }

    await this.storage.savePriceLists(this.normalizePriorities(filtered));
    return { message: 'Fiyat listesi silindi' };
  }

  private async enrichPriceList(
    priceList: PriceListRecord,
  ): Promise<PriceListResponse> {
    const resolved = await this.references.resolveReferences({
      customerGroupId: priceList.customerGroupId,
      scopeType: priceList.scopeType,
      categoryId: priceList.categoryId,
      productId: priceList.productId,
      adjustmentType: priceList.adjustmentType,
      amount: priceList.amount,
      startsAt: priceList.startsAt,
      endsAt: priceList.endsAt,
    });

    return {
      ...priceList,
      customerGroupName: resolved.customerGroupName,
      scopeLabel: this.getScopeLabel(priceList.scopeType),
      targetId: resolved.categoryId ?? resolved.productId,
      targetName:
        resolved.categoryName ??
        resolved.productName ??
        (priceList.scopeType === PriceListScopeType.ALL_PRODUCTS
          ? 'Tum urunler'
          : undefined),
      adjustmentLabel: this.getAdjustmentLabel(
        priceList.adjustmentType,
        priceList.amount,
      ),
      effectiveStatus: this.getEffectiveStatus(priceList),
    };
  }

  private normalizeCreateDto(dto: CreatePriceListDto) {
    return {
      name: dto.name.trim(),
      description: this.optionalString(dto.description),
      customerGroupId: this.optionalString(dto.customerGroupId),
      scopeType: dto.scopeType,
      categoryId:
        dto.scopeType === PriceListScopeType.CATEGORY
          ? this.optionalString(dto.categoryId)
          : undefined,
      productId:
        dto.scopeType === PriceListScopeType.PRODUCT
          ? this.optionalString(dto.productId)
          : undefined,
      adjustmentType: dto.adjustmentType,
      amount: dto.amount,
      priority: dto.priority,
      isActive: dto.isActive,
      startsAt: this.optionalString(dto.startsAt),
      endsAt: this.optionalString(dto.endsAt),
    };
  }

  private mergePriceList(current: PriceListRecord, dto: UpdatePriceListDto) {
    const nextScopeType = dto.scopeType ?? current.scopeType;

    return {
      ...current,
      name: dto.name !== undefined ? dto.name.trim() : current.name,
      description:
        dto.description !== undefined
          ? this.optionalString(dto.description)
          : current.description,
      customerGroupId:
        dto.customerGroupId !== undefined
          ? this.optionalString(dto.customerGroupId)
          : current.customerGroupId,
      scopeType: nextScopeType,
      categoryId:
        nextScopeType === PriceListScopeType.CATEGORY
          ? dto.categoryId !== undefined
            ? this.optionalString(dto.categoryId)
            : current.categoryId
          : undefined,
      productId:
        nextScopeType === PriceListScopeType.PRODUCT
          ? dto.productId !== undefined
            ? this.optionalString(dto.productId)
            : current.productId
          : undefined,
      adjustmentType: dto.adjustmentType ?? current.adjustmentType,
      amount: dto.amount ?? current.amount,
      priority: dto.priority ?? current.priority,
      isActive: dto.isActive ?? current.isActive,
      startsAt:
        dto.startsAt !== undefined
          ? this.optionalString(dto.startsAt)
          : current.startsAt,
      endsAt:
        dto.endsAt !== undefined
          ? this.optionalString(dto.endsAt)
          : current.endsAt,
      updatedAt: new Date().toISOString(),
    };
  }

  private optionalString(value?: string) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }

  private sortPriceLists(priceLists: PriceListRecord[]) {
    return [...priceLists].sort((left, right) => {
      if (left.priority !== right.priority) {
        return left.priority - right.priority;
      }

      return left.createdAt.localeCompare(right.createdAt);
    });
  }

  private normalizePriorities(priceLists: PriceListRecord[]) {
    return this.sortPriceLists(priceLists).map((priceList, index) => ({
      ...priceList,
      priority: index + 1,
    }));
  }

  private getNextPriority(priceLists: PriceListRecord[]) {
    if (priceLists.length === 0) {
      return 1;
    }

    return Math.max(...priceLists.map((priceList) => priceList.priority)) + 1;
  }

  private getScopeLabel(scopeType: PriceListScopeType) {
    switch (scopeType) {
      case PriceListScopeType.CATEGORY:
        return 'Kategori';
      case PriceListScopeType.PRODUCT:
        return 'Urun';
      default:
        return 'Tum urunler';
    }
  }

  private getAdjustmentLabel(
    adjustmentType: PriceListAdjustmentType,
    amount: number,
  ) {
    switch (adjustmentType) {
      case PriceListAdjustmentType.FIXED_PRICE:
        return `${amount} TRY sabit fiyat`;
      case PriceListAdjustmentType.FIXED_DISCOUNT:
        return `${amount} TRY indirim`;
      default:
        return `%${amount} indirim`;
    }
  }

  private getEffectiveStatus(priceList: PriceListRecord) {
    if (!priceList.isActive) {
      return PriceListEffectiveStatus.INACTIVE;
    }

    const now = new Date();
    if (priceList.startsAt && new Date(priceList.startsAt) > now) {
      return PriceListEffectiveStatus.SCHEDULED;
    }

    if (priceList.endsAt && new Date(priceList.endsAt) < now) {
      return PriceListEffectiveStatus.EXPIRED;
    }

    return PriceListEffectiveStatus.ACTIVE;
  }
}
