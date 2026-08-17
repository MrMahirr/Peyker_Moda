import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsArray,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '@prisma/client';

// ========== CAMPAIGNS ==========

export class CreateCampaignDto {
  @ApiProperty({ example: 'Yaz İndirimi', description: 'Kampanya adı' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Tüm yaz ürünlerinde %20 indirim',
    description: 'Açıklama',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'YAZ20', description: 'Kampanya kodu' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({
    enum: DiscountType,
    example: 'PERCENTAGE',
    description: 'İndirim tipi',
  })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({
    example: 20,
    description: 'İndirim değeri (yüzde veya tutar)',
  })
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiPropertyOptional({ example: 100, description: 'Minimum sepet tutarı' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minPurchase?: number;

  @ApiPropertyOptional({ example: 500, description: 'Maksimum indirim tutarı' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxDiscount?: number;

  @ApiProperty({ example: '2026-06-01', description: 'Başlangıç tarihi' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-08-31', description: 'Bitiş tarihi' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({
    example: ['category-uuid-1'],
    description: 'Geçerli kategori IDleri',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  categoryIds?: string[];

  @ApiPropertyOptional({
    example: ['product-uuid-1'],
    description: 'Geçerli ürün IDleri',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  productIds?: string[];

  @ApiPropertyOptional({ example: true, description: 'Kampanya durumu' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateCampaignDto {
  @ApiPropertyOptional({ example: 'Yaz İndirimi' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Açıklama' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'YAZ20' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ enum: DiscountType })
  @IsEnum(DiscountType)
  @IsOptional()
  discountType?: DiscountType;

  @ApiPropertyOptional({ example: 20 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountValue?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minPurchase?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxDiscount?: number;

  @ApiPropertyOptional({ example: '2026-06-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-08-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// ========== COUPONS ==========

export class CreateCouponDto {
  @ApiProperty({ example: 'SUMMER20', description: 'Kupon kodu' })
  @IsString()
  code: string;

  @ApiPropertyOptional({
    example: 'Yaz indirimi kuponu',
    description: 'Açıklama',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: DiscountType, example: 'PERCENTAGE' })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({ example: 15, description: 'İndirim değeri' })
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiPropertyOptional({ example: 200, description: 'Minimum sepet tutarı' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minPurchase?: number;

  @ApiPropertyOptional({ example: 100, description: 'Maksimum indirim' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxDiscount?: number;

  @ApiPropertyOptional({ example: 100, description: 'Kullanım limiti' })
  @IsInt()
  @Min(1)
  @IsOptional()
  usageLimit?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Müşteri başına kullanım limiti',
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  usageLimitPerCustomer?: number;

  @ApiProperty({ example: '2026-01-01', description: 'Başlangıç tarihi' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-12-31', description: 'Bitiş tarihi' })
  @IsDateString()
  endDate: string;
}

export class UpdateCouponDto {
  @ApiPropertyOptional({ example: 'Açıklama' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: DiscountType })
  @IsEnum(DiscountType)
  @IsOptional()
  discountType?: DiscountType;

  @ApiPropertyOptional({ example: 15 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountValue?: number;

  @ApiPropertyOptional({ example: 200 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minPurchase?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxDiscount?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsInt()
  @Min(1)
  @IsOptional()
  usageLimit?: number;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class ValidateCouponDto {
  @ApiProperty({ example: 'SUMMER20', description: 'Kupon kodu' })
  @IsString()
  code: string;

  @ApiProperty({ example: 500, description: 'Sepet tutarı' })
  @IsNumber()
  @Min(0)
  cartTotal: number;

  @ApiPropertyOptional({ example: 'customer-uuid' })
  @IsUUID()
  @IsOptional()
  customerId?: string;
}
