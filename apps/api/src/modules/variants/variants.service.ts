import {
    Injectable,
    NotFoundException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVariantDto, UpdateVariantDto } from './dto';
import { generateSku } from '../../common/utils';

@Injectable()
export class VariantsService {
    private readonly logger = new Logger(VariantsService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Ürüne ait varyantları getir
     */
    async findByProduct(productId: string) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new NotFoundException('Ürün bulunamadı');
        }

        return this.prisma.variant.findMany({
            where: { productId },
            orderBy: [{ color: 'asc' }, { size: 'asc' }],
        });
    }

    /**
     * Varyant detayı
     */
    async findOne(id: string) {
        const variant = await this.prisma.variant.findUnique({
            where: { id },
            include: {
                product: {
                    select: { id: true, name: true, sku: true },
                },
            },
        });

        if (!variant) {
            throw new NotFoundException('Varyant bulunamadı');
        }

        return variant;
    }

    /**
     * Yeni varyant oluştur
     */
    async create(productId: string, createVariantDto: CreateVariantDto) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new NotFoundException('Ürün bulunamadı');
        }

        // SKU yoksa otomatik oluştur
        let sku = createVariantDto.sku;
        if (!sku) {
            const suffix = `${createVariantDto.size || 'X'}-${createVariantDto.color?.substring(0, 3).toUpperCase() || 'STD'}`;
            sku = `${product.sku}-${suffix}`;
        }

        // SKU benzersiz mi kontrol et
        const existingSku = await this.prisma.variant.findUnique({
            where: { sku },
        });

        if (existingSku) {
            throw new ConflictException('Bu SKU zaten kullanılıyor');
        }

        // Barkod varsa benzersiz mi kontrol et
        if (createVariantDto.barcode) {
            const existingBarcode = await this.prisma.variant.findUnique({
                where: { barcode: createVariantDto.barcode },
            });

            if (existingBarcode) {
                throw new ConflictException('Bu barkod zaten kullanılıyor');
            }
        }

        const variant = await this.prisma.variant.create({
            data: {
                ...createVariantDto,
                sku,
                productId,
            },
        });

        this.logger.log(`Yeni varyant oluşturuldu: ${variant.sku}`);

        return variant;
    }

    /**
     * Varyant güncelle
     */
    async update(id: string, updateVariantDto: UpdateVariantDto) {
        await this.findOne(id);

        // SKU değişiyorsa benzersizlik kontrol et
        if (updateVariantDto.sku) {
            const existingSku = await this.prisma.variant.findFirst({
                where: { sku: updateVariantDto.sku, NOT: { id } },
            });

            if (existingSku) {
                throw new ConflictException('Bu SKU zaten kullanılıyor');
            }
        }

        // Barkod değişiyorsa benzersizlik kontrol et
        if (updateVariantDto.barcode) {
            const existingBarcode = await this.prisma.variant.findFirst({
                where: { barcode: updateVariantDto.barcode, NOT: { id } },
            });

            if (existingBarcode) {
                throw new ConflictException('Bu barkod zaten kullanılıyor');
            }
        }

        const variant = await this.prisma.variant.update({
            where: { id },
            data: updateVariantDto,
        });

        this.logger.log(`Varyant güncellendi: ${variant.sku}`);

        return variant;
    }

    /**
     * Varyant sil
     */
    async remove(id: string) {
        const variant = await this.findOne(id);

        // Sipariş öğelerinde kullanılıyor mu kontrol et
        const orderItemCount = await this.prisma.orderItem.count({
            where: { variantId: id },
        });

        if (orderItemCount > 0) {
            throw new ConflictException(
                'Bu varyant siparişlerde kullanılıyor. Silinemez.',
            );
        }

        await this.prisma.variant.delete({
            where: { id },
        });

        this.logger.log(`Varyant silindi: ${variant.sku}`);

        return { message: 'Varyant başarıyla silindi' };
    }

    /**
     * Toplu varyant oluştur (beden ve renk kombinasyonları)
     */
    async bulkCreate(
        productId: string,
        sizes: string[],
        colors: { name: string; code?: string }[],
        baseStock = 0,
    ) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new NotFoundException('Ürün bulunamadı');
        }

        const variants: any[] = [];

        for (const color of colors) {
            for (const size of sizes) {
                const sku = `${product.sku}-${size}-${color.name.substring(0, 3).toUpperCase()}`;

                // SKU zaten varsa atla
                const exists = await this.prisma.variant.findUnique({
                    where: { sku },
                });

                if (!exists) {
                    const variant = await this.prisma.variant.create({
                        data: {
                            productId,
                            sku,
                            size,
                            color: color.name,
                            colorCode: color.code,
                            stock: baseStock,
                        },
                    });
                    variants.push(variant);
                }
            }
        }

        this.logger.log(`${variants.length} varyant oluşturuldu: ${product.name}`);

        return variants;
    }
}
