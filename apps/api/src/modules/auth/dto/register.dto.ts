import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MinLength,
    IsEnum,
    IsOptional
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class RegisterDto {
    @ApiProperty({
        example: 'admin@peykermoda.com',
        description: 'Kullanıcı email adresi',
    })
    @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
    @IsNotEmpty({ message: 'Email adresi zorunludur' })
    email: string;

    @ApiProperty({
        example: 'password123',
        description: 'Kullanıcı şifresi (min 6 karakter)',
    })
    @IsString()
    @IsNotEmpty({ message: 'Şifre zorunludur' })
    @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
    password: string;

    @ApiProperty({
        example: 'Ahmet',
        description: 'Kullanıcı adı',
    })
    @IsString()
    @IsNotEmpty({ message: 'Ad zorunludur' })
    firstName: string;

    @ApiProperty({
        example: 'Yılmaz',
        description: 'Kullanıcı soyadı',
    })
    @IsString()
    @IsNotEmpty({ message: 'Soyad zorunludur' })
    lastName: string;

    @ApiPropertyOptional({
        example: '+905551234567',
        description: 'Telefon numarası',
    })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional({
        enum: UserRole,
        example: UserRole.STAFF,
        description: 'Kullanıcı rolü',
    })
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
}
