import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminSeedService implements OnModuleInit {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.ensureAdminUser();
  }

  private getString(key: string, fallback: string) {
    return this.configService.get<string>(key) || fallback;
  }

  private getBool(key: string, fallback = false) {
    const value = this.configService.get<string>(key);
    if (value === undefined) return fallback;
    return value === 'true' || value === '1';
  }

  private async ensureAdminUser() {
    const email = this.getString('app.adminEmail', 'admin@peyker.com');
    const password = this.getString('app.adminPassword', 'Admin123!');
    const firstName = this.getString('app.adminFirstName', 'Admin');
    const lastName = this.getString('app.adminLastName', 'Peyker');
    const forcePassword = this.getBool('app.adminForcePassword', false);

    const role = await this.prisma.role.findUnique({
      where: { name: 'admin' },
    });

    if (!role) {
      this.logger.warn('Admin role not found. Admin user not seeded.');
      return;
    }

    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!existing) {
      const hashedPassword = await bcrypt.hash(password, 12);
      await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          roleId: role.id,
          isActive: true,
        },
      });
      this.logger.log(`Admin user created: ${email}`);
      return;
    }

    const updateData: Record<string, unknown> = {};
    if (existing.roleId !== role.id) updateData.roleId = role.id;
    if (!existing.isActive) updateData.isActive = true;
    if (forcePassword) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    if (Object.keys(updateData).length > 0) {
      await this.prisma.user.update({
        where: { id: existing.id },
        data: updateData,
      });
      this.logger.log(`Admin user ensured: ${email}`);
    }
  }
}
