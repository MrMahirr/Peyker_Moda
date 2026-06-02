import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto';

export interface TokenPayload {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
  roleName: string;
}

const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MINUTES = 15;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Kullanıcı email ve şifresini doğrular (hesap kilitleme dahil)
   */
  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthenticatedUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      return null;
    }

    // Hesap kilitli mi kontrol et
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new ForbiddenException(
        `Hesabınız kilitli. ${remainingMinutes} dakika sonra tekrar deneyin.`,
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Başarısız giriş sayacını artır
      const failedLogins = user.failedLogins + 1;
      const updateData: Record<string, unknown> = { failedLogins };

      if (failedLogins >= MAX_FAILED_LOGINS) {
        const lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + LOCKOUT_MINUTES);
        updateData.lockedUntil = lockUntil;
        this.logger.warn(
          `Hesap kilitlendi: ${email} (${MAX_FAILED_LOGINS} başarısız deneme)`,
        );
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      return null;
    }

    // Başarılı giriş — sayacı sıfırla
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLogins: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
      roleName: user.role.name,
    };
  }

  /**
   * Kullanıcı girişi - Access ve Refresh token döner
   */
  async login(user: AuthenticatedUser): Promise<TokenPayload> {
    const payload = {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.roleName,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(user.id);

    this.logger.log('Kullanıcı giriş yaptı', { email: user.email, userId: user.id });

    return {
      accessToken,
      refreshToken,
      expiresIn: 86400, // 24 saat (saniye cinsinden)
    };
  }

  /**
   * Yeni kullanıcı kaydı
   */
  async register(registerDto: RegisterDto): Promise<AuthenticatedUser> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Bu email adresi zaten kullanılıyor');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    // Varsayılan rol: staff
    let roleId = registerDto.roleId;
    if (!roleId) {
      const staffRole = await this.prisma.role.findUnique({
        where: { name: 'staff' },
      });
      roleId = staffRole?.id || '';
    }

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        roleId,
      },
      include: { role: true },
    });

    this.logger.log(`Yeni kullanıcı oluşturuldu: ${user.email}`);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
      roleName: user.role.name,
    };
  }

  /**
   * Refresh token ile yeni access token al
   */
  async refreshToken(refreshToken: string): Promise<TokenPayload> {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException(
        'Geçersiz veya süresi dolmuş refresh token',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: storedToken.userId },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'Kullanıcı bulunamadı veya hesabı aktif değil',
      );
    }

    // Eski refresh token'ı sil
    await this.prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    return this.login({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
      roleName: user.role.name,
    });
  }

  /**
   * Çıkış yap - Refresh token'ı sil
   */
  async logout(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    this.logger.log(`Kullanıcı çıkış yaptı: ${userId}`);
  }

  /**
   * Refresh token oluştur ve kaydet
   */
  private async generateRefreshToken(userId: string): Promise<string> {
    const refreshExpiresIn = this.configService.get(
      'app.jwtRefreshExpiresIn',
      '7d',
    );
    const token = this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get<string>('app.jwtSecret'),
        expiresIn: refreshExpiresIn as any,
      },
    );

    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { token, userId, expiresAt },
    });

    return token;
  }

  /**
   * Kullanıcı bilgilerini getir
   */
  async getProfile(userId: string): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
      roleName: user.role.name,
    };
  }

  /**
   * Profil bilgilerini güncelle
   */
  async updateProfile(
    userId: string,
    data: { firstName?: string; lastName?: string; email?: string },
  ): Promise<AuthenticatedUser> {
    if (data.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        throw new ConflictException('Bu email adresi zaten kullanılıyor');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      include: { role: true },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
      roleName: user.role.name,
    };
  }

  /**
   * Şifre değiştir
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı');
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Mevcut şifre hatalı');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Şifre güncellendi' };
  }
}
