import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

export interface CustomerJwtPayload {
  sub: string;
  email: string;
  type: string;
}

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(Strategy, 'jwt-customer') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('app.jwtSecret') || 'super-secret-key-change-in-production',
    });
  }

  async validate(payload: CustomerJwtPayload) {
    if (payload.type !== 'CUSTOMER') {
      throw new UnauthorizedException('Geçersiz token tipi');
    }

    const customer = await this.prisma.customer.findUnique({
      where: { id: payload.sub },
    });

    if (!customer || !customer.isActive) {
      throw new UnauthorizedException(
        'Müşteri bulunamadı veya hesabı aktif değil',
      );
    }

    return customer;
  }
}
