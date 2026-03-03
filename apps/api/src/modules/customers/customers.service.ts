import {
    Injectable,
    NotFoundException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerQueryDto } from './dto';
import { getPaginationParams, createPaginatedResult } from '../../common/utils';

@Injectable()
export class CustomersService {
    private readonly logger = new Logger(CustomersService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Müşteri listesi (filtreleme ve sayfalama ile)
     */
    async findAll(query: CustomerQueryDto) {
        const { page, limit, skip } = getPaginationParams(query);

        const where: any = {};

        // Arama
        if (query.search) {
            where.OR = [
                { firstName: { contains: query.search, mode: 'insensitive' } },
                { lastName: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
                { phone: { contains: query.search, mode: 'insensitive' } },
            ];
        }

        // Grup filtresi
        if (query.groupId) {
            where.groupId = query.groupId;
        }

        // Cinsiyet filtresi
        if (query.gender) {
            where.gender = query.gender;
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

        const [customers, total] = await Promise.all([
            this.prisma.customer.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    group: {
                        select: { id: true, name: true },
                    },
                    _count: {
                        select: { orders: true },
                    },
                },
            }),
            this.prisma.customer.count({ where }),
        ]);

        return createPaginatedResult(customers, total, page, limit);
    }

    /**
     * Tekil müşteri getir
     */
    async findOne(id: string) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: {
                group: {
                    select: { id: true, name: true, discount: true },
                },
                _count: {
                    select: { orders: true },
                },
            },
        });

        if (!customer) {
            throw new NotFoundException('Müşteri bulunamadı');
        }

        return customer;
    }

    /**
     * Müşteri siparişleri
     */
    async findOrders(id: string, page = 1, limit = 10) {
        await this.findOne(id);

        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where: { customerId: id },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    orderNumber: true,
                    status: true,
                    totalAmount: true,
                    createdAt: true,
                    _count: {
                        select: { items: true },
                    },
                },
            }),
            this.prisma.order.count({ where: { customerId: id } }),
        ]);

        return createPaginatedResult(orders, total, page, limit);
    }

    /**
     * Müşteri istatistikleri
     */
    async getStats(id: string) {
        await this.findOne(id);

        const [orderStats, lastOrder] = await Promise.all([
            this.prisma.order.aggregate({
                where: { customerId: id },
                _sum: { totalAmount: true },
                _count: true,
                _avg: { totalAmount: true },
            }),
            this.prisma.order.findFirst({
                where: { customerId: id },
                orderBy: { createdAt: 'desc' },
                select: { createdAt: true, orderNumber: true },
            }),
        ]);

        return {
            totalOrders: orderStats._count,
            totalSpent: orderStats._sum.totalAmount || 0,
            averageOrderValue: orderStats._avg.totalAmount || 0,
            lastOrderDate: lastOrder?.createdAt || null,
            lastOrderNumber: lastOrder?.orderNumber || null,
        };
    }

    /**
     * Yeni müşteri oluştur
     */
    async create(createCustomerDto: CreateCustomerDto) {
        // Email benzersiz mi kontrol et
        if (createCustomerDto.email) {
            const existingEmail = await this.prisma.customer.findFirst({
                where: { email: createCustomerDto.email },
            });

            if (existingEmail) {
                throw new ConflictException('Bu email adresi zaten kullanılıyor');
            }
        }

        // Telefon benzersiz mi kontrol et
        if (createCustomerDto.phone) {
            const existingPhone = await this.prisma.customer.findFirst({
                where: { phone: createCustomerDto.phone },
            });

            if (existingPhone) {
                throw new ConflictException('Bu telefon numarası zaten kullanılıyor');
            }
        }

        const customer = await this.prisma.customer.create({
            data: {
                ...createCustomerDto,
                birthDate: createCustomerDto.birthDate
                    ? new Date(createCustomerDto.birthDate)
                    : undefined,
            },
            include: {
                group: { select: { id: true, name: true } },
            },
        });

        this.logger.log(`Yeni müşteri oluşturuldu: ${customer.firstName} ${customer.lastName}`);

        return customer;
    }

    /**
     * Müşteri güncelle
     */
    async update(id: string, updateCustomerDto: UpdateCustomerDto) {
        await this.findOne(id);

        // Email değişiyorsa benzersizlik kontrol et
        if (updateCustomerDto.email) {
            const existingEmail = await this.prisma.customer.findFirst({
                where: { email: updateCustomerDto.email, NOT: { id } },
            });

            if (existingEmail) {
                throw new ConflictException('Bu email adresi zaten kullanılıyor');
            }
        }

        // Telefon değişiyorsa benzersizlik kontrol et
        if (updateCustomerDto.phone) {
            const existingPhone = await this.prisma.customer.findFirst({
                where: { phone: updateCustomerDto.phone, NOT: { id } },
            });

            if (existingPhone) {
                throw new ConflictException('Bu telefon numarası zaten kullanılıyor');
            }
        }

        const data: any = { ...updateCustomerDto };
        if (updateCustomerDto.birthDate) {
            data.birthDate = new Date(updateCustomerDto.birthDate);
        }

        const customer = await this.prisma.customer.update({
            where: { id },
            data,
            include: {
                group: { select: { id: true, name: true } },
            },
        });

        this.logger.log(`Müşteri güncellendi: ${customer.firstName} ${customer.lastName}`);

        return customer;
    }

    /**
     * Müşteri sil (soft delete)
     */
    async remove(id: string) {
        const customer = await this.findOne(id);

        await this.prisma.customer.update({
            where: { id },
            data: { isActive: false },
        });

        this.logger.log(`Müşteri silindi: ${customer.firstName} ${customer.lastName}`);

        return { message: 'Müşteri başarıyla silindi' };
    }

    /**
     * Telefon ile müşteri ara (POS için hızlı arama)
     */
    async findByPhone(phone: string) {
        const customer = await this.prisma.customer.findFirst({
            where: { phone },
            include: {
                group: { select: { id: true, name: true, discount: true } },
            },
        });

        if (!customer) {
            throw new NotFoundException('Müşteri bulunamadı');
        }

        return customer;
    }

    /**
     * Hızlı müşteri arama (autocomplete için)
     */
    async quickSearch(term: string, limit = 5) {
        const customers = await this.prisma.customer.findMany({
            where: {
                isActive: true,
                OR: [
                    { firstName: { contains: term, mode: 'insensitive' } },
                    { lastName: { contains: term, mode: 'insensitive' } },
                    { phone: { contains: term, mode: 'insensitive' } },
                ],
            },
            take: limit,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
            },
        });

        return customers.map((c) => ({
            id: c.id,
            name: `${c.firstName} ${c.lastName}`,
            phone: c.phone,
            email: c.email,
        }));
    }
}
