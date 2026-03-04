import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          select: { id: true, resource: true, action: true },
        },
        _count: { select: { users: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          select: { id: true, resource: true, action: true },
        },
        _count: { select: { users: true } },
      },
    });

    if (!role) {
      throw new NotFoundException('Rol bulunamadı');
    }

    return role;
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.prisma.role.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new BadRequestException('Bu isimde bir rol zaten mevcut');
    }

    return this.prisma.role.create({
      data: {
        name: dto.name,
        displayName: dto.displayName,
        description: dto.description,
        permissions: dto.permissions
          ? {
              create: dto.permissions.map((p) => ({
                resource: p.resource,
                action: p.action,
              })),
            }
          : undefined,
      },
      include: {
        permissions: {
          select: { id: true, resource: true, action: true },
        },
      },
    });
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.findOne(id);

    if (role.isSystem && dto.name && dto.name !== role.name) {
      throw new BadRequestException('Sistem rolünün adı değiştirilemez');
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        displayName: dto.displayName,
        description: dto.description,
      },
      include: {
        permissions: {
          select: { id: true, resource: true, action: true },
        },
      },
    });
  }

  async remove(id: string) {
    const role = await this.findOne(id);

    if (role.isSystem) {
      throw new BadRequestException('Sistem rolleri silinemez');
    }

    if (role._count.users > 0) {
      throw new BadRequestException(
        'Bu role atanmış kullanıcılar var — önce kullanıcıları başka bir role atayın',
      );
    }

    await this.prisma.role.delete({ where: { id } });
    return { message: 'Rol silindi' };
  }

  async assignPermissions(id: string, dto: AssignPermissionsDto) {
    await this.findOne(id);

    // Mevcut izinleri sil
    await this.prisma.permission.deleteMany({
      where: { roleId: id },
    });

    // Yeni izinleri ekle
    await this.prisma.permission.createMany({
      data: dto.permissions.map((p) => ({
        roleId: id,
        resource: p.resource,
        action: p.action,
      })),
    });

    this.logger.log(`Rol ${id} için ${dto.permissions.length} izin atandı`);

    return this.findOne(id);
  }
}
