import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto, CategoryQueryDto } from './dto';
import { slugify } from '../../common/utils';

@Injectable()
export class CategoriesService {
    private readonly logger = new Logger(CategoriesService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Tüm kategorileri getir (tree yapısında veya düz liste)
     */
    async findAll(query: CategoryQueryDto) {
        const where: any = {};

        if (query.isActive !== undefined) {
            where.isActive = query.isActive;
        }

        // Belirli bir parent'ın alt kategorilerini getir
        if (query.parentId) {
            where.parentId = query.parentId;
        } else if (!query.includeChildren) {
            // Sadece ana kategorileri getir (parentId null olanlar)
            where.parentId = null;
        }

        const categories = await this.prisma.category.findMany({
            where,
            orderBy: [{ order: 'asc' }, { name: 'asc' }],
            include: query.includeChildren
                ? {
                    children: {
                        where: query.isActive !== undefined ? { isActive: query.isActive } : {},
                        orderBy: [{ order: 'asc' }, { name: 'asc' }],
                        include: {
                            children: {
                                where: query.isActive !== undefined ? { isActive: query.isActive } : {},
                                orderBy: [{ order: 'asc' }, { name: 'asc' }],
                            },
                        },
                    },
                }
                : undefined,
        });

        return categories;
    }

    /**
     * Kategori ağacı (tree) olarak getir
     */
    async findTree() {
        const categories = await this.prisma.category.findMany({
            where: { parentId: null, isActive: true },
            orderBy: [{ order: 'asc' }, { name: 'asc' }],
            include: {
                children: {
                    where: { isActive: true },
                    orderBy: [{ order: 'asc' }, { name: 'asc' }],
                    include: {
                        children: {
                            where: { isActive: true },
                            orderBy: [{ order: 'asc' }, { name: 'asc' }],
                        },
                    },
                },
            },
        });

        return categories;
    }

    /**
     * Tekil kategori getir
     */
    async findOne(id: string) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                parent: {
                    select: { id: true, name: true, slug: true },
                },
                children: {
                    where: { isActive: true },
                    orderBy: [{ order: 'asc' }, { name: 'asc' }],
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        imageUrl: true,
                        order: true,
                    },
                },
                _count: {
                    select: { products: true },
                },
            },
        });

        if (!category) {
            throw new NotFoundException('Kategori bulunamadı');
        }

        return category;
    }

    /**
     * Yeni kategori oluştur
     */
    async create(createCategoryDto: CreateCategoryDto) {
        // Slug oluştur
        const slug = slugify(createCategoryDto.name);

        // Slug benzersiz mi kontrol et
        const existingCategory = await this.prisma.category.findUnique({
            where: { slug },
        });

        if (existingCategory) {
            throw new ConflictException('Bu isimde bir kategori zaten mevcut');
        }

        // Parent kategori varsa kontrol et
        if (createCategoryDto.parentId) {
            const parentCategory = await this.prisma.category.findUnique({
                where: { id: createCategoryDto.parentId },
            });

            if (!parentCategory) {
                throw new BadRequestException('Üst kategori bulunamadı');
            }
        }

        const category = await this.prisma.category.create({
            data: {
                ...createCategoryDto,
                slug,
            },
        });

        this.logger.log(`Yeni kategori oluşturuldu: ${category.name}`);

        return category;
    }

    /**
     * Kategori güncelle
     */
    async update(id: string, updateCategoryDto: UpdateCategoryDto) {
        await this.findOne(id);

        const data: any = { ...updateCategoryDto };

        // İsim değişiyorsa slug güncelle
        if (updateCategoryDto.name) {
            const slug = slugify(updateCategoryDto.name);

            // Slug benzersiz mi kontrol et (kendi kendisi hariç)
            const existingCategory = await this.prisma.category.findFirst({
                where: {
                    slug,
                    NOT: { id },
                },
            });

            if (existingCategory) {
                throw new ConflictException('Bu isimde bir kategori zaten mevcut');
            }

            data.slug = slug;
        }

        // Parent değişiyorsa kontrol et
        if (updateCategoryDto.parentId) {
            // Kendi kendine parent olmasın
            if (updateCategoryDto.parentId === id) {
                throw new BadRequestException('Kategori kendi kendine üst kategori olamaz');
            }

            const parentCategory = await this.prisma.category.findUnique({
                where: { id: updateCategoryDto.parentId },
            });

            if (!parentCategory) {
                throw new BadRequestException('Üst kategori bulunamadı');
            }
        }

        const category = await this.prisma.category.update({
            where: { id },
            data,
        });

        this.logger.log(`Kategori güncellendi: ${category.name}`);

        return category;
    }

    /**
     * Kategori sil (soft delete)
     */
    async remove(id: string) {
        const category = await this.findOne(id);

        // Alt kategorileri kontrol et
        const childCount = await this.prisma.category.count({
            where: { parentId: id },
        });

        if (childCount > 0) {
            throw new BadRequestException(
                'Bu kategorinin alt kategorileri var. Önce alt kategorileri silin veya taşıyın.',
            );
        }

        // Ürün sayısını kontrol et
        const productCount = await this.prisma.product.count({
            where: { categoryId: id },
        });

        if (productCount > 0) {
            throw new BadRequestException(
                'Bu kategoride ürünler var. Önce ürünleri başka bir kategoriye taşıyın.',
            );
        }

        await this.prisma.category.update({
            where: { id },
            data: { isActive: false },
        });

        this.logger.log(`Kategori silindi: ${category.name}`);

        return { message: 'Kategori başarıyla silindi' };
    }

    /**
     * Kategori sıralamasını güncelle
     */
    async updateOrder(id: string, order: number) {
        await this.findOne(id);

        await this.prisma.category.update({
            where: { id },
            data: { order },
        });

        return { message: 'Sıralama güncellendi' };
    }
}
