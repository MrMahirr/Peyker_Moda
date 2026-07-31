import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
    constructor(private prisma: PrismaService) {}

    async create(createSupplierDto: CreateSupplierDto) {
        return this.prisma.supplier.create({
            data: {
                ...createSupplierDto,
                account: {
                    create: {
                        balance: 0,
                    }
                }
            },
        });
    }

    async findAll() {
        return this.prisma.supplier.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { id },
        });

        if (!supplier) {
            throw new NotFoundException(`Supplier with ID ${id} not found`);
        }

        return supplier;
    }

    async update(id: string, updateSupplierDto: UpdateSupplierDto) {
        await this.findOne(id); // Check if exists

        return this.prisma.supplier.update({
            where: { id },
            data: updateSupplierDto,
        });
    }

    async remove(id: string) {
        await this.findOne(id); // Check if exists

        return this.prisma.supplier.delete({
            where: { id },
        });
    }
}
