import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerGroupDto, UpdateCustomerGroupDto } from './dto';

@Injectable()
export class CustomerGroupsService {
    private readonly logger = new Logger(CustomerGroupsService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Tüm grupları getir
     */
    async findAll() {
        const groups = await this.prisma.customerGroup.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { customers: true },
                },
            },
        });

        return groups;
    }

    /**
     * Tekil grup getir
     */
    async findOne(id: string) {
        const group = await this.prisma.customerGroup.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { customers: true },
                },
            },
        });

        if (!group) {
            throw new NotFoundException('Müşteri grubu bulunamadı');
        }

        return group;
    }

    /**
     * Yeni grup oluştur
     */
    async create(createCustomerGroupDto: CreateCustomerGroupDto) {
        // İsim benzersiz mi kontrol et
        const existingGroup = await this.prisma.customerGroup.findFirst({
            where: { name: createCustomerGroupDto.name },
        });

        if (existingGroup) {
            throw new ConflictException('Bu isimde bir grup zaten mevcut');
        }

        const group = await this.prisma.customerGroup.create({
            data: createCustomerGroupDto,
        });

        this.logger.log(`Yeni müşteri grubu oluşturuldu: ${group.name}`);

        return group;
    }

    /**
     * Grup güncelle
     */
    async update(id: string, updateCustomerGroupDto: UpdateCustomerGroupDto) {
        await this.findOne(id);

        // İsim değişiyorsa benzersizlik kontrol et
        if (updateCustomerGroupDto.name) {
            const existingGroup = await this.prisma.customerGroup.findFirst({
                where: { name: updateCustomerGroupDto.name, NOT: { id } },
            });

            if (existingGroup) {
                throw new ConflictException('Bu isimde bir grup zaten mevcut');
            }
        }

        const group = await this.prisma.customerGroup.update({
            where: { id },
            data: updateCustomerGroupDto,
        });

        this.logger.log(`Müşteri grubu güncellendi: ${group.name}`);

        return group;
    }

    /**
     * Grup sil
     */
    async remove(id: string) {
        const group = await this.findOne(id);

        // Müşterisi var mı kontrol et
        const customerCount = await this.prisma.customer.count({
            where: { groupId: id },
        });

        if (customerCount > 0) {
            throw new BadRequestException(
                `Bu grupta ${customerCount} müşteri var. Önce müşterileri başka bir gruba taşıyın.`,
            );
        }

        await this.prisma.customerGroup.delete({
            where: { id },
        });

        this.logger.log(`Müşteri grubu silindi: ${group.name}`);

        return { message: 'Grup başarıyla silindi' };
    }

    /**
     * Gruba müşteri ekle
     */
    async addCustomer(groupId: string, customerId: string) {
        await this.findOne(groupId);

        const customer = await this.prisma.customer.findUnique({
            where: { id: customerId },
        });

        if (!customer) {
            throw new NotFoundException('Müşteri bulunamadı');
        }

        await this.prisma.customer.update({
            where: { id: customerId },
            data: { groupId },
        });

        return { message: 'Müşteri gruba eklendi' };
    }

    /**
     * Gruptan müşteri çıkar
     */
    async removeCustomer(customerId: string) {
        const customer = await this.prisma.customer.findUnique({
            where: { id: customerId },
        });

        if (!customer) {
            throw new NotFoundException('Müşteri bulunamadı');
        }

        await this.prisma.customer.update({
            where: { id: customerId },
            data: { groupId: null },
        });

        return { message: 'Müşteri gruptan çıkarıldı' };
    }
}
