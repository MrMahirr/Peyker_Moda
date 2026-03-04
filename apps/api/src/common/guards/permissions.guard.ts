import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Admin rolü her zaman tam yetkili
    if (user.role?.name === 'admin' || user.roleName === 'admin') {
      return true;
    }

    // Kullanıcının rolüne ait izinleri getir
    const roleId = user.roleId || user.role?.id;
    if (!roleId) {
      return false;
    }

    const permissions = await this.prisma.permission.findMany({
      where: { roleId },
      select: { resource: true, action: true },
    });

    const userPermissions = new Set(
      permissions.map((p) => `${p.resource}:${p.action}`),
    );

    const hasAllPermissions = requiredPermissions.every((perm) =>
      userPermissions.has(perm),
    );

    if (!hasAllPermissions) {
      this.logger.warn(
        `İzin reddedildi: ${user.email} — gerekli: ${requiredPermissions.join(', ')}`,
      );
    }

    return hasAllPermissions;
  }
}
