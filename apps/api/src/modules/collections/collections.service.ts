import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateCollectionDto,
  UpdateCollectionDto,
  CollectionQueryDto,
  SetCollectionProductsDto,
} from './dto';
import { slugify } from '../../common/utils';

@Injectable()
export class CollectionsService {
  private readonly logger = new Logger(CollectionsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Tüm koleksiyonları getir (düz liste)
   */
  async findAll(query: CollectionQueryDto) {
    const where: any = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    return this.prisma.collection.findMany({
      where,
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { products: true } } },
    });
  }

  /**
   * Tekil koleksiyon getir (ürünleriyle birlikte)
   */
  async findOne(id: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: {
        products: {
          include: { category: true, variants: true },
        },
        _count: { select: { products: true } },
      },
    });

    if (!collection) {
      throw new NotFoundException('Koleksiyon bulunamadı');
    }

    return collection;
  }

  /**
   * Slug ile koleksiyon getir (storefront için)
   */
  async findBySlug(slug: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          include: { category: true, variants: true },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException('Koleksiyon bulunamadı');
    }

    return collection;
  }

  /**
   * Yeni koleksiyon oluştur
   */
  async create(dto: CreateCollectionDto) {
    const slug = slugify(dto.slug || dto.name);

    const existing = await this.prisma.collection.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('Bu URL ile bir koleksiyon zaten mevcut');
    }

    const { slug: _ignoredSlug, ...rest } = dto;

    const collection = await this.prisma.collection.create({
      data: {
        ...rest,
        slug,
      },
    });

    this.logger.log(`Yeni koleksiyon oluşturuldu: ${collection.name}`);

    return collection;
  }

  /**
   * Koleksiyon güncelle
   */
  async update(id: string, dto: UpdateCollectionDto) {
    await this.findOne(id);

    const data: any = { ...dto };

    if (dto.slug || dto.name) {
      const slug = slugify(dto.slug || dto.name!);

      const existing = await this.prisma.collection.findFirst({
        where: { slug, NOT: { id } },
      });

      if (existing) {
        throw new ConflictException('Bu URL ile bir koleksiyon zaten mevcut');
      }

      data.slug = slug;
    }

    const collection = await this.prisma.collection.update({
      where: { id },
      data,
    });

    this.logger.log(`Koleksiyon güncellendi: ${collection.name}`);

    return collection;
  }

  /**
   * Koleksiyon sil (soft delete) — ürünler etkilenmez
   */
  async remove(id: string) {
    const collection = await this.findOne(id);

    await this.prisma.collection.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log(`Koleksiyon silindi: ${collection.name}`);

    return { message: 'Koleksiyon başarıyla silindi' };
  }

  /**
   * Koleksiyon sıralamasını güncelle
   */
  async updateOrder(id: string, order: number) {
    await this.findOne(id);

    await this.prisma.collection.update({
      where: { id },
      data: { order },
    });

    return { message: 'Sıralama güncellendi' };
  }

  /**
   * Koleksiyonun ürün listesini tamamen değiştir (checkbox seçiminden gelen tam liste)
   */
  async setProducts(id: string, dto: SetCollectionProductsDto) {
    await this.findOne(id);

    const collection = await this.prisma.collection.update({
      where: { id },
      data: {
        products: {
          set: dto.productIds.map((productId) => ({ id: productId })),
        },
      },
      include: { _count: { select: { products: true } } },
    });

    this.logger.log(
      `Koleksiyon ürünleri güncellendi: ${collection.name} (${dto.productIds.length} ürün)`,
    );

    return collection;
  }
}
