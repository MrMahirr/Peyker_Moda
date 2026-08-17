import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsInt,
  Min,
  IsUUID,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductVariantDto {
  @ApiProperty({ example: 'SKU-VAR-1', description: 'Varyant SKU' })
  @IsString()
  sku: string;

  @ApiPropertyOptional({
    example: '8697123456789',
    description: 'Varyant Barkod',
  })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiPropertyOptional({ example: 49.99, description: 'Varyant Fiyatı' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ example: 'M', description: 'Beden' })
  @IsString()
  @IsOptional()
  size?: string;

  @ApiPropertyOptional({ example: 'Mavi', description: 'Renk' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ example: '#0000FF', description: 'Renk Kodu' })
  @IsString()
  @IsOptional()
  colorCode?: string;

  @ApiPropertyOptional({ example: 10, description: 'Stok Adedi' })
  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Kadın Blazer Ceket', description: 'Ürün adı' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Şık ve zarif blazer ceket',
    description: 'Ürün açıklaması',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'SKU-1234-5678', description: 'Stok kodu' })
  @IsString()
  sku: string;

  @ApiPropertyOptional({ example: '8697123456789', description: 'Barkod' })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiProperty({ example: 499.99, description: 'Satış fiyatı' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    example: 599.99,
    description: 'Karşılaştırma fiyatı (indirimli ürünler için)',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  comparePrice?: number;

  @ApiPropertyOptional({ example: 250.0, description: 'Maliyet fiyatı' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  cost?: number;

  @ApiProperty({ example: 'category-uuid', description: 'Kategori ID' })
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({ example: 'Zara', description: 'Marka' })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({ example: true, description: 'Öne çıkan ürün' })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Aktif durumda mı' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    type: [String],
    description: 'Medyaların referans ID dizisi',
  })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  mediaIds?: string[];

  @ApiPropertyOptional({
    type: [CreateProductVariantDto],
    description: 'Ürün Varyantları',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  @IsOptional()
  variants?: CreateProductVariantDto[];
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Kadın Blazer Ceket' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Şık ve zarif blazer ceket' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'SKU-1234-5678' })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({ example: '8697123456789' })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiPropertyOptional({ example: 499.99 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ example: 599.99 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  comparePrice?: number;

  @ApiPropertyOptional({ example: 250.0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  cost?: number;

  @ApiPropertyOptional({ example: 'category-uuid' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'Zara' })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    type: [String],
    description: 'Medyaların referans ID dizisi',
  })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  mediaIds?: string[];

  @ApiPropertyOptional({
    type: [CreateProductVariantDto],
    description: 'Ürün Varyantları',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  @IsOptional()
  variants?: CreateProductVariantDto[];
}

export class ProductQueryDto {
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

  @ApiPropertyOptional({ example: 'blazer', description: 'Arama terimi' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 'category-uuid', description: 'Kategori ID' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'Zara', description: 'Marka' })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({ example: 100, description: 'Minimum fiyat' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional({ example: 500, description: 'Maksimum fiyat' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxPrice?: number;

  @ApiPropertyOptional({ example: true, description: 'Stokta var mı' })
  @IsBoolean()
  @IsOptional()
  inStock?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Öne çıkan' })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: 'price',
    description: 'Sıralama alanı: name, price, createdAt',
  })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({
    example: 'asc',
    description: 'Sıralama yönü: asc, desc',
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}

export class UpdateStockDto {
  @ApiProperty({ example: 50, description: 'Yeni stok miktarı' })
  @IsInt()
  @Min(0)
  stock: number;
}
