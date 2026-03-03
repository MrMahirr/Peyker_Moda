import {
    Injectable,
    NotFoundException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto';
import { getPaginationParams, createPaginatedResult } from '../../common/utils';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Tüm kullanıcıları listele (sayfalama ile)
     */
    async findAll(query: UserQueryDto) {
        const { page, limit, skip } = getPaginationParams(query);

        const where: any = {};

        if (query.search) {
            where.OR = [
                { firstName: { contains: query.search, mode: 'insensitive' } },
                { lastName: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
            ];
        }

        if (query.role) {
            where.role = query.role;
        }

        if (query.isActive !== undefined) {
            where.isActive = query.isActive;
        }

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                },
            }),
            this.prisma.user.count({ where }),
        ]);

        return createPaginatedResult(users, total, page, limit);
    }

    /**
     * Tekil kullanıcı getir
     */
    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatar: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new NotFoundException('Kullanıcı bulunamadı');
        }

        return user;
    }

    /**
     * Yeni kullanıcı oluştur
     */
    async create(createUserDto: CreateUserDto) {
        // Email kontrolü
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createUserDto.email },
        });

        if (existingUser) {
            throw new ConflictException('Bu email adresi zaten kullanılıyor');
        }

        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

        const user = await this.prisma.user.create({
            data: {
                ...createUserDto,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });

        this.logger.log(`Yeni kullanıcı oluşturuldu: ${user.email}`);

        return user;
    }

    /**
     * Kullanıcı güncelle
     */
    async update(id: string, updateUserDto: UpdateUserDto) {
        // Kullanıcı var mı kontrol et
        await this.findOne(id);

        // Email değişiyorsa, başka biri kullanıyor mu kontrol et
        if (updateUserDto.email) {
            const existingUser = await this.prisma.user.findFirst({
                where: {
                    email: updateUserDto.email,
                    NOT: { id },
                },
            });

            if (existingUser) {
                throw new ConflictException('Bu email adresi zaten kullanılıyor');
            }
        }

        // Şifre güncellenmişse hashle
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
        }

        const user = await this.prisma.user.update({
            where: { id },
            data: updateUserDto,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                isActive: true,
                updatedAt: true,
            },
        });

        this.logger.log(`Kullanıcı güncellendi: ${user.email}`);

        return user;
    }

    /**
     * Kullanıcı sil (soft delete - isActive = false)
     */
    async remove(id: string) {
        await this.findOne(id);

        await this.prisma.user.update({
            where: { id },
            data: { isActive: false },
        });

        this.logger.log(`Kullanıcı silindi: ${id}`);

        return { message: 'Kullanıcı başarıyla silindi' };
    }
}
