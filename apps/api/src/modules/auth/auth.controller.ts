import {
    Controller,
    Post,
    Body,
    Get,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto';
import { LocalAuthGuard, JwtAuthGuard } from '../../common/guards';
import { CurrentUser, Roles } from '../../common/decorators';
import { UserRole } from '@prisma/client';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @UseGuards(LocalAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Kullanıcı girişi' })
    @ApiResponse({ status: 200, description: 'Başarılı giriş' })
    @ApiResponse({ status: 401, description: 'Geçersiz kimlik bilgileri' })
    async login(@CurrentUser() user: any, @Body() loginDto: LoginDto) {
        return this.authService.login(user);
    }

    @Post('register')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Yeni kullanıcı oluştur (Admin/Manager)' })
    @ApiResponse({ status: 201, description: 'Kullanıcı oluşturuldu' })
    @ApiResponse({ status: 409, description: 'Email zaten kullanılıyor' })
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Access token yenile' })
    @ApiResponse({ status: 200, description: 'Token yenilendi' })
    @ApiResponse({ status: 401, description: 'Geçersiz refresh token' })
    async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.refreshToken(refreshTokenDto.refreshToken);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Çıkış yap' })
    @ApiResponse({ status: 200, description: 'Başarılı çıkış' })
    async logout(@CurrentUser('id') userId: string) {
        await this.authService.logout(userId);
        return { message: 'Çıkış başarılı' };
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Mevcut kullanıcı bilgisi' })
    @ApiResponse({ status: 200, description: 'Kullanıcı bilgisi' })
    async getProfile(@CurrentUser('id') userId: string) {
        return this.authService.getProfile(userId);
    }
}
