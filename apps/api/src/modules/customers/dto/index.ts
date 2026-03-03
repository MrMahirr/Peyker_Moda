import {
    IsString,
    IsOptional,
    IsBoolean,
    IsEmail,
    IsInt,
    Min,
    IsUUID,
    IsDateString,
    IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@prisma/client';

export class CreateCustomerDto {
    @ApiProperty({ example: 'Ayşe', description: 'Müşteri adı' })
    @IsString()
    firstName: string;

    @ApiProperty({ example: 'Yılmaz', description: 'Müşteri soyadı' })
    @IsString()
    lastName: string;

    @ApiPropertyOptional({ example: 'ayse@email.com', description: 'Email adresi' })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({ example: '+905551234567', description: 'Telefon numarası' })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional({ enum: Gender, example: 'FEMALE', description: 'Cinsiyet' })
    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender;

    @ApiPropertyOptional({ example: '1990-05-15', description: 'Doğum tarihi' })
    @IsDateString()
    @IsOptional()
    birthDate?: string;

    @ApiPropertyOptional({ example: 'İstanbul, Kadıköy', description: 'Adres' })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiPropertyOptional({ example: 'Düzenli müşteri, premium ürünleri tercih ediyor', description: 'Notlar' })
    @IsString()
    @IsOptional()
    notes?: string;

    @ApiPropertyOptional({ example: 'customer-group-uuid', description: 'Müşteri grubu ID' })
    @IsUUID()
    @IsOptional()
    groupId?: string;
}

export class UpdateCustomerDto {
    @ApiPropertyOptional({ example: 'Ayşe' })
    @IsString()
    @IsOptional()
    firstName?: string;

    @ApiPropertyOptional({ example: 'Yılmaz' })
    @IsString()
    @IsOptional()
    lastName?: string;

    @ApiPropertyOptional({ example: 'ayse@email.com' })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({ example: '+905551234567' })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional({ enum: Gender })
    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender;

    @ApiPropertyOptional({ example: '1990-05-15' })
    @IsDateString()
    @IsOptional()
    birthDate?: string;

    @ApiPropertyOptional({ example: 'İstanbul, Kadıköy' })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiPropertyOptional({ example: 'Notlar' })
    @IsString()
    @IsOptional()
    notes?: string;

    @ApiPropertyOptional({ example: 'customer-group-uuid' })
    @IsUUID()
    @IsOptional()
    groupId?: string;

    @ApiPropertyOptional({ example: true })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

export class CustomerQueryDto {
    @ApiPropertyOptional({ example: 1 })
    @IsInt()
    @Min(1)
    @IsOptional()
    page?: number;

    @ApiPropertyOptional({ example: 10 })
    @IsInt()
    @Min(1)
    @IsOptional()
    limit?: number;

    @ApiPropertyOptional({ example: 'ayşe', description: 'Ad, soyad, email veya telefon ile arama' })
    @IsString()
    @IsOptional()
    search?: string;

    @ApiPropertyOptional({ example: 'customer-group-uuid', description: 'Grup ID' })
    @IsUUID()
    @IsOptional()
    groupId?: string;

    @ApiPropertyOptional({ enum: Gender })
    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender;

    @ApiPropertyOptional({ example: true })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiPropertyOptional({ example: 'totalSpent', description: 'Sıralama: firstName, createdAt, totalSpent' })
    @IsString()
    @IsOptional()
    sortBy?: string;

    @ApiPropertyOptional({ example: 'desc' })
    @IsString()
    @IsOptional()
    sortOrder?: 'asc' | 'desc';
}
