import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // user.role is now a Role object with a 'name' property
    const userRoleName = user.role?.name || user.roleName;

    if (!userRoleName) {
      this.logger.warn(`Kullanıcı ${user.id} için rol bilgisi bulunamadı`);
      return false;
    }

    const hasRole = requiredRoles.includes(userRoleName);

    if (!hasRole) {
      this.logger.warn(
        `Erişim reddedildi: ${user.email} (${userRoleName}) — gerekli: ${requiredRoles.join(', ')}`,
      );
    }

    return hasRole;
  }
}
