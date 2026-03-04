import {
    Injectable,
    NotFoundException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto, UpdateStockDto } from './dto';
import { slugify, getPaginationParams, createPaginatedResult } from '../../common/utils';

@Injectable()
export class ProductsService {
    private readonly logger = new Logger(ProductsService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Ürün listesi (filtreleme ve sayfalama ile)
     */
    async findAll(query: ProductQueryDto) {
        const { page, limit, skip } = getPaginationParams(query);

        const where: any = {};

        // Arama
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { sku: { contains: query.search, mode: 'insensitive' } },
                { barcode: { contains: query.search, mode: 'insensitive' } },
                { brand: { contains: query.search, mode: 'insensitive' } },
            ];
        }

        // Kategori filtresi
        if (query.categoryId) {
            where.categoryId = query.categoryId;
        }

        // Marka filtresi
        if (query.brand) {
            where.brand = { contains: query.brand, mode: 'insensitive' };
        }

        // Fiyat aralığı
        if (query.minPrice !== undefined || query.maxPrice !== undefined) {
            where.price = {};
            if (query.minPrice !== undefined) {
                where.price.gte = query.minPrice;
            }
            if (query.maxPrice !== undefined) {
                where.price.lte = query.maxPrice;
            }
        }

        // Stok durumu
        if (query.inStock !== undefined) {
            where.variants = query.inStock
                ? { some: { stock: { gt: 0 } } }
                : { every: { stock: 0 } };
        }

        // Öne çıkan
        if (query.isFeatured !== undefined) {
            where.isFeatured = query.isFeatured;
        }

        // Aktif durumu
        if (query.isActive !== undefined) {
            where.isActive = query.isActive;
        }

        // Sıralama
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
                    category: {
                        select: { id: true, name: true, slug: true },
                    },

                    variants: {
                        select: { id: true, sku: true, stock: true, size: true, color: true, price: true },
                    },
                },
            }),
            this.prisma.product.count({ where }),
        ]);

        // Her ürün için toplam stok hesapla
        const productsWithStock = products.map((product) => ({
            ...product,
            totalStock: product.variants.reduce((sum, v) => sum + v.stock, 0),
            primaryImage: (product.images as any)?.[0]?.url || null,
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
                category: {
                    select: { id: true, name: true, slug: true },
                },

                variants: {
                    orderBy: { createdAt: 'asc' },
                },
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
        // Önce ürün barkodunda ara
        let product = await this.prisma.product.findUnique({
            where: { barcode },
            include: {
                variants: true,

            },
        });

        // Ürün bulunamazsa varyant barkodunda ara
        if (!product) {
            const variant = await this.prisma.variant.findUnique({
                where: { barcode },
                include: {
                    product: {
                        include: {
                            variants: true,

                        },
                    },
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
            include: {

                variants: {
                    select: { stock: true },
                },
            },
        });

        return products.map((p) => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            price: p.basePrice,
            image: (p.images as any)?.[0]?.url || null,
            totalStock: p.variants.reduce((sum, v) => sum + v.stock, 0),
        }));
    }

    /**
     * Yeni ürün oluştur
     */
    async create(createProductDto: CreateProductDto) {
        // Slug oluştur
        const slug = slugify(createProductDto.name);

        // SKU benzersiz mi kontrol et
        const existingSku = await this.prisma.product.findUnique({
            where: { sku: createProductDto.sku },
        });

        if (existingSku) {
            throw new ConflictException('Bu SKU zaten kullanılıyor');
        }

        // Barkod varsa benzersiz mi kontrol et
        if (createProductDto.barcode) {
            const existingBarcode = await this.prisma.product.findUnique({
                where: { barcode: createProductDto.barcode },
            });

            if (existingBarcode) {
                throw new ConflictException('Bu barkod zaten kullanılıyor');
            }
        }

        // Slug benzersiz mi kontrol et, varsa sayı ekle
        let uniqueSlug = slug;
        let counter = 1;
        while (await this.prisma.product.findUnique({ where: { slug: uniqueSlug } })) {
            uniqueSlug = `${slug}-${counter}`;
            counter++;
        }

        const { price, variants, ...rest } = createProductDto;
        const product = await this.prisma.product.create({
            data: {
                ...rest,
                basePrice: price,
                slug: uniqueSlug,
                variants: variants?.length ? {
                    create: variants.map(v => ({
                        ...v,
                        price: v.price ?? price,
                        stock: v.stock ?? 0
                    }))
                } : undefined
            },
            include: {
                category: { select: { id: true, name: true } },
                variants: true
            },
        });

        this.logger.log(`Yeni ürün oluşturuldu: ${product.name}`);

        return product;
    }

    /**
     * Ürün güncelle
     */
    async update(id: string, updateProductDto: UpdateProductDto) {
        await this.findOne(id);

        const data: any = { ...updateProductDto };

        // İsim değişiyorsa slug güncelle
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

        // SKU değişiyorsa benzersizlik kontrol et
        if (updateProductDto.sku) {
            const existingSku = await this.prisma.product.findFirst({
                where: { sku: updateProductDto.sku, NOT: { id } },
            });

            if (existingSku) {
                throw new ConflictException('Bu SKU zaten kullanılıyor');
            }
        }

        // Barkod değişiyorsa benzersizlik kontrol et
        if (updateProductDto.barcode) {
            const existingBarcode = await this.prisma.product.findFirst({
                where: { barcode: updateProductDto.barcode, NOT: { id } },
            });

            if (existingBarcode) {
                throw new ConflictException('Bu barkod zaten kullanılıyor');
            }
        }

        const product = await this.prisma.product.update({
            where: { id },
            data,
            include: {
                category: { select: { id: true, name: true } },
            },
        });

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
