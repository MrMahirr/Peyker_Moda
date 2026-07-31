import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  UpdateStockDto,
} from './dto';
import {
  slugify,
  getPaginationParams,
  createPaginatedResult,
  generateBarcode,
} from '../../common/utils';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  /**
   * Ürün listesi (filtreleme ve sayfalama ile)
   */
  async findAll(query: ProductQueryDto) {
    const { page, limit, skip } = getPaginationParams(query);

    const where: any = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
        { barcode: { contains: query.search, mode: 'insensitive' } },
        { brand: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.brand) {
      where.brand = { contains: query.brand, mode: 'insensitive' };
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) {
        where.price.gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        where.price.lte = query.maxPrice;
      }
    }

    if (query.inStock !== undefined) {
      where.variants = query.inStock
        ? { some: { stock: { gt: 0 } } }
        : { every: { stock: 0 } };
    }

    if (query.isFeatured !== undefined) {
      where.isFeatured = query.isFeatured;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const orderBy: any = {};
    if (query.sortBy) {
      orderBy[query.sortBy] = query.sortOrder || 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          variants: {
            select: {
              id: true,
              sku: true,
              stock: true,
              size: true,
              color: true,
              price: true,
            },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const productsWithStock = products.map((product) => ({
      ...product,
      totalStock: product.variants.reduce((sum, v) => sum + v.stock, 0),
      primaryImage:
        Array.isArray(product.images) && product.images.length > 0
          ? (product.images[0] as any).url || null
          : null,
    }));

    return createPaginatedResult(productsWithStock, total, page, limit);
  }

  /**
   * Tekil ürün getir
   */
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    return {
      ...product,
      totalStock: product.variants.reduce((sum, v) => sum + v.stock, 0),
    };
  }

  /**
   * Barkod ile ürün ara (POS için)
   */
  async findByBarcode(barcode: string) {
    const product = await this.prisma.product.findUnique({
      where: { barcode },
      include: { variants: true },
    });

    if (!product) {
      const variant = await this.prisma.variant.findUnique({
        where: { barcode },
        include: {
          product: { include: { variants: true } },
        },
      });

      if (variant) {
        return {
          ...variant.product,
          selectedVariant: variant,
        };
      }
    }

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    return product;
  }

  /**
   * Ürün arama
   */
  async search(term: string, limit = 10) {
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { sku: { contains: term, mode: 'insensitive' } },
          { barcode: { contains: term, mode: 'insensitive' } },
        ],
      },
      take: limit,
      include: { variants: { select: { stock: true } } },
    });

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      price: p.basePrice,
      image:
        Array.isArray(p.images) && p.images.length > 0
          ? (p.images[0] as any).url || null
          : null,
      totalStock: p.variants.reduce((sum, v) => sum + v.stock, 0),
    }));
  }

  /**
   * Yeni ürün oluştur
   */
  async create(createProductDto: CreateProductDto) {
    const slug = slugify(createProductDto.name);

    let uniqueSlug = slug;
    let counter = 1;
    while (
      await this.prisma.product.findUnique({ where: { slug: uniqueSlug } })
    ) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    const { price, comparePrice, variants, mediaIds, ...rest } =
      createProductDto;

    let mediaData: any[] = [];
    if (mediaIds && mediaIds.length > 0) {
      mediaData = await this.prisma.media.findMany({
        where: { id: { in: mediaIds } },
        select: { id: true, url: true, alt: true },
      });
    }

    let processedVariants: any[] = [];
    if (variants?.length) {
      for (const v of variants) {
        let barcode = v.barcode;
        if (!barcode) {
          barcode = generateBarcode();
          // Çakışma kontrolü
          for (let i = 0; i < 5; i++) {
            const existingBarcode = await this.prisma.variant.findUnique({
              where: { barcode },
            });
            if (!existingBarcode) break;
            barcode = generateBarcode();
          }
        }
        processedVariants.push({
          ...v,
          barcode,
          price: v.price ?? price,
          stock: v.stock ?? 0,
        });
      }
    }

    const product = await this.prisma.product.create({
      data: {
        ...rest,
        basePrice: price,
        salePrice: comparePrice,
        slug: uniqueSlug,
        images: mediaData as any, // Cast to any to bypass Prisma Json strict typing
        variants: processedVariants.length
          ? {
              create: processedVariants,
            }
          : undefined,
      },
      include: {
        category: { select: { id: true, name: true } },
        variants: true,
      },
    });

    this.logger.log(`Yeni ürün oluşturuldu: ${product.name}`);
    return product;
  }

  /**
   * Ürün güncelle
   */
  async update(id: string, updateProductDto: UpdateProductDto) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    const { mediaIds, variants, price, comparePrice, ...rest } =
      updateProductDto;
    const data: any = { ...rest };

    if (price !== undefined) {
      data.basePrice = price;
    }
    if (comparePrice !== undefined) {
      data.salePrice = comparePrice;
    }

    if (updateProductDto.name) {
      const slug = slugify(updateProductDto.name);
      let uniqueSlug = slug;
      let counter = 1;

      while (true) {
        const existing = await this.prisma.product.findFirst({
          where: { slug: uniqueSlug, NOT: { id } },
        });
        if (!existing) break;
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }
      data.slug = uniqueSlug;
    }

    // Medya güncellemesi varsa (Orphaned file cleanup)
    if (mediaIds !== undefined) {
      let oldMediaIds: string[] = [];
      if (Array.isArray(existingProduct.images)) {
        oldMediaIds = existingProduct.images
          .map((m: any) => m.id)
          .filter(Boolean);
      }

      // Yeni media datalarını çek
      let newMediaData: any[] = [];
      if (mediaIds.length > 0) {
        newMediaData = await this.prisma.media.findMany({
          where: { id: { in: mediaIds } },
          select: { id: true, url: true, alt: true },
        });
      }
      data.images = newMediaData as any; // Cast to any to bypass Prisma Json strict typing

      // Artık kullanılmayan (silinen) resimleri S3'ten uçur
      const removedMediaIds = oldMediaIds.filter(
        (oldId) => !mediaIds.includes(oldId),
      );
      for (const removedId of removedMediaIds) {
        // UploadService hatayı yutmayabilir, DB transaction vs için senkron bekle ya da fire and forget yap
        try {
          await this.uploadService.deleteFile(removedId);
        } catch (err) {
          this.logger.warn(
            `Ürün resmi tamamen silinemedi (S3 Orphaned): ${removedId} - ${err.message}`,
          );
        }
      }
    }

    const product = await this.prisma.product.update({
      where: { id },
      data,
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    // Varyant güncelleme işlemleri (Upsert / Soft Delete)
    if (variants) {
      const currentVariants = await this.prisma.variant.findMany({
        where: { productId: id },
      });
      const incomingSkus = variants.map((v) => v.sku);

      // Gelen listede olmayanları silmeyi dene, hata alırsan (ilişki varsa) pasif yapıp stoğunu sıfırla
      const variantsToDelete = currentVariants.filter(
        (v) => !incomingSkus.includes(v.sku),
      );
      for (const v of variantsToDelete) {
        try {
          await this.prisma.variant.delete({ where: { id: v.id } });
        } catch (e) {
          await this.prisma.variant.update({
            where: { id: v.id },
            data: { isActive: false, stock: 0 },
          });
        }
      }

      // Yeni gelenleri ekle veya mevcut olanları güncelle
      for (const v of variants) {
        const existing = currentVariants.find((cv) => cv.sku === v.sku);
        if (existing) {
          await this.prisma.variant.update({
            where: { id: existing.id },
            data: {
              price: v.price ?? existing.price,
              stock: v.stock ?? existing.stock,
              size: v.size,
              color: v.color,
              colorCode: v.colorCode,
              barcode: v.barcode,
              isActive: true,
            },
          });
        } else {
          let barcode = v.barcode;
          if (!barcode) {
            barcode = generateBarcode();
            for (let i = 0; i < 5; i++) {
              const existingBarcode = await this.prisma.variant.findUnique({
                where: { barcode },
              });
              if (!existingBarcode) break;
              barcode = generateBarcode();
            }
          }

          await this.prisma.variant.create({
            data: {
              ...v,
              barcode,
              productId: id,
              price: v.price ?? data.basePrice ?? existingProduct.basePrice,
              stock: v.stock ?? 0,
              isActive: true,
            },
          });
        }
      }
    }

    this.logger.log(`Ürün güncellendi: ${product.name}`);
    return product;
  }

  /**
   * Ürün sil (soft delete)
   */
  async remove(id: string) {
    const product = await this.findOne(id);

    await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log(`Ürün silindi: ${product.name}`);
    return { message: 'Ürün başarıyla silindi' };
  }

  /**
   * Varyant stoğunu güncelle
   */
  async updateStock(variantId: string, stock: number) {
    const variant = await this.prisma.variant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      throw new NotFoundException('Varyant bulunamadı');
    }

    await this.prisma.variant.update({
      where: { id: variantId },
      data: { stock },
    });

    this.logger.log(`Stok güncellendi: ${variantId} -> ${stock}`);
    return { message: 'Stok güncellendi', variantId, stock };
  }
}
