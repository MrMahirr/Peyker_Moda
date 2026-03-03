import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto';
import { User, UserRole } from '@prisma/client';

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
    role: UserRole;
}

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    /**
     * Kullanıcı email ve şifresini doğrular
     */
    async validateUser(email: string, password: string): Promise<AuthenticatedUser | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.isActive) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return null;
        }

        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        };
    }

    /**
     * Kullanıcı girişi - Access ve Refresh token döner
     */
    async login(user: AuthenticatedUser): Promise<TokenPayload> {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = this.jwtService.sign(payload);
        const refreshToken = await this.generateRefreshToken(user.id);

        this.logger.log(`Kullanıcı giriş yaptı: ${user.email}`);

        return {
            accessToken,
            refreshToken,
            expiresIn: 900, // 15 dakika (saniye cinsinden)
        };
    }

    /**
     * Yeni kullanıcı kaydı
     */
    async register(registerDto: RegisterDto): Promise<AuthenticatedUser> {
        // Email kontrolü
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerDto.email },
        });

        if (existingUser) {
            throw new ConflictException('Bu email adresi zaten kullanılıyor');
        }

        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(registerDto.password, 12);

        // Kullanıcı oluştur
        const user = await this.prisma.user.create({
            data: {
                email: registerDto.email,
                password: hashedPassword,
                firstName: registerDto.firstName,
                lastName: registerDto.lastName,
                phone: registerDto.phone,
                role: registerDto.role || UserRole.STAFF,
            },
        });

        this.logger.log(`Yeni kullanıcı oluşturuldu: ${user.email}`);

        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
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
            throw new UnauthorizedException('Geçersiz veya süresi dolmuş refresh token');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: storedToken.userId },
        });

        if (!user || !user.isActive) {
            throw new UnauthorizedException('Kullanıcı bulunamadı veya hesabı aktif değil');
        }

        // Eski refresh token'ı sil
        await this.prisma.refreshToken.delete({
            where: { id: storedToken.id },
        });

        // Yeni tokenlar oluştur
        return this.login({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
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
        // @ts-ignore
        const token = this.jwtService.sign(
            { sub: userId } as any,
            {
                secret: this.configService.get<string>('app.jwtSecret'),
                expiresIn: this.configService.get<string>('app.jwtRefreshExpiresIn', '7d') as any,
            },
        );

        // Eski tokenları temizle
        await this.prisma.refreshToken.deleteMany({
            where: { userId },
        });

        // Yeni token'ı kaydet
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 gün

        await this.prisma.refreshToken.create({
            data: {
                token,
                userId,
                expiresAt,
            },
        });

        return token;
    }

    /**
     * Kullanıcı bilgilerini getir
     */
    async getProfile(userId: string): Promise<AuthenticatedUser> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('Kullanıcı bulunamadı');
        }

        return user;
    }
}
