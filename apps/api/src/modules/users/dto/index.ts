import { IsEmail, IsString, IsOptional, IsEnum, IsBoolean, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
    @ApiProperty({ example: 'user@peykermoda.com' })
    @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
    email: string;

    @ApiProperty({ example: 'password123', minLength: 6 })
    @IsString()
    @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
    password: string;

    @ApiProperty({ example: 'Ahmet' })
    @IsString()
    firstName: string;

    @ApiProperty({ example: 'Yılmaz' })
    @IsString()
    lastName: string;

    @ApiPropertyOptional({ example: '+905551234567' })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional({ enum: UserRole, default: UserRole.STAFF })
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
}

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'user@peykermoda.com' })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({ example: 'newpassword123', minLength: 6 })
    @IsString()
    @MinLength(6)
    @IsOptional()
    password?: string;

    @ApiPropertyOptional({ example: 'Ahmet' })
    @IsString()
    @IsOptional()
    firstName?: string;

    @ApiPropertyOptional({ example: 'Yılmaz' })
    @IsString()
    @IsOptional()
    lastName?: string;

    @ApiPropertyOptional({ example: '+905551234567' })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional({ enum: UserRole })
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;

    @ApiPropertyOptional({ example: true })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

export class UserQueryDto {
    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    page?: number;

    @ApiPropertyOptional({ example: 10 })
    @IsOptional()
    limit?: number;

    @ApiPropertyOptional({ example: 'ahmet' })
    @IsString()
    @IsOptional()
    search?: string;

    @ApiPropertyOptional({ enum: UserRole })
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;

    @ApiPropertyOptional({ example: true })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
