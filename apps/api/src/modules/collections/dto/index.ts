import { IsString, IsOptional, IsBoolean, IsInt, Min, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCollectionDto {
  @ApiProperty({ example: 'Yaz 2026', description: 'Koleksiyon adı' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'yaz-2026',
    description: 'Koleksiyonun URL adresi (belirtilmezse isimden otomatik üretilir)',
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({
    example: 'Yazın en taze parçaları bu koleksiyonda.',
    description: 'Koleksiyon açıklaması',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/kapak.jpg',
    description: 'Koleksiyon kapak görseli',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 0, description: 'Sıralama' })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateCollectionDto {
  @ApiPropertyOptional({ example: 'Yaz 2026' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'yaz-2026' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ example: 'Yazın en taze parçaları bu koleksiyonda.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/kapak.jpg' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CollectionQueryDto {
  @ApiPropertyOptional({ example: true, description: 'Sadece aktif koleksiyonlar' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class SetCollectionProductsDto {
  @ApiProperty({
    example: ['uuid-1', 'uuid-2'],
    description: 'Koleksiyona dahil edilecek ürün ID listesi (tam liste, mevcut seçimin yerine geçer)',
  })
  @IsArray()
  @IsString({ each: true })
  productIds: string[];
}
