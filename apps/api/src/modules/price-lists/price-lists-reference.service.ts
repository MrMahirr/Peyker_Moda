import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PriceListAdjustmentType,
  PriceListMetadataResponse,
  PriceListScopeType,
  ResolvedPriceListReferences,
} from './price-lists.types';

interface ResolvePriceListInput {
  customerGroupId?: string;
  scopeType: PriceListScopeType;
  categoryId?: string;
  productId?: string;
  adjustmentType: PriceListAdjustmentType;
  amount: number;
  startsAt?: string;
  endsAt?: string;
}

@Injectable()
export class PriceListsReferenceService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetadata(): Promise<PriceListMetadataResponse> {
    const [customerGroups, categories, products] = await Promise.all([
      this.prisma.customerGroup.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
      }),
      this.prisma.category.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
      }),
      this.prisma.product.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, sku: true },
      }),
    ]);

    return {
      customerGroups,
      categories,
      products,
    };
  }

  async resolveReferences(
    input: ResolvePriceListInput,
  ): Promise<ResolvedPriceListReferences> {
    this.validateBusinessRules(input);

    const resolved: ResolvedPriceListReferences = {};

    if (input.customerGroupId) {
      const customerGroup = await this.prisma.customerGroup.findUnique({
        where: { id: input.customerGroupId },
        select: { id: true, name: true },
      });

      if (!customerGroup) {
        throw new NotFoundException('Musteri grubu bulunamadi');
      }

      resolved.customerGroupId = customerGroup.id;
      resolved.customerGroupName = customerGroup.name;
    }

    if (input.scopeType === PriceListScopeType.CATEGORY) {
      const category = await this.prisma.category.findUnique({
        where: { id: input.categoryId as string },
        select: { id: true, name: true },
      });

      if (!category) {
        throw new NotFoundException('Kategori bulunamadi');
      }

      resolved.categoryId = category.id;
      resolved.categoryName = category.name;
    }

    if (input.scopeType === PriceListScopeType.PRODUCT) {
      const product = await this.prisma.product.findUnique({
        where: { id: input.productId as string },
        select: { id: true, name: true },
      });

      if (!product) {
        throw new NotFoundException('Urun bulunamadi');
      }

      resolved.productId = product.id;
      resolved.productName = product.name;
    }

    return resolved;
  }

  private validateBusinessRules(input: ResolvePriceListInput) {
    if (input.amount <= 0) {
      throw new BadRequestException('Tutar sifirdan buyuk olmalidir');
    }

    if (
      input.adjustmentType === PriceListAdjustmentType.PERCENTAGE_DISCOUNT &&
      (input.amount <= 0 || input.amount > 100)
    ) {
      throw new BadRequestException(
        'Yuzdesel indirim 0 ile 100 arasinda olmalidir',
      );
    }

    if (
      input.scopeType === PriceListScopeType.CATEGORY &&
      !input.categoryId
    ) {
      throw new BadRequestException(
        'Kategori bazli fiyat listesi icin kategori secilmelidir',
      );
    }

    if (
      input.scopeType === PriceListScopeType.PRODUCT &&
      !input.productId
    ) {
      throw new BadRequestException(
        'Urun bazli fiyat listesi icin urun secilmelidir',
      );
    }

    if (
      input.scopeType === PriceListScopeType.CATEGORY &&
      input.productId
    ) {
      throw new BadRequestException(
        'Kategori bazli listede urun secimi kullanilamaz',
      );
    }

    if (
      input.scopeType === PriceListScopeType.PRODUCT &&
      input.categoryId
    ) {
      throw new BadRequestException(
        'Urun bazli listede kategori secimi kullanilamaz',
      );
    }

    if (input.startsAt && input.endsAt) {
      const startsAt = new Date(input.startsAt);
      const endsAt = new Date(input.endsAt);

      if (startsAt.getTime() > endsAt.getTime()) {
        throw new BadRequestException(
          'Baslangic tarihi bitis tarihinden sonra olamaz',
        );
      }
    }
  }
}
