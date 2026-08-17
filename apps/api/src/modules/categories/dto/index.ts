import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Kadın Giyim', description: 'Kategori adı' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Kadın giyim koleksiyonu',
    description: 'Kategori açıklaması',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/image.jpg',
    description: 'Kategori görseli',
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({
    example: 'uuid-of-parent',
    description: 'Üst kategori ID (alt kategori için)',
  })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({ example: 0, description: 'Sıralama' })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Kadın Giyim' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Kadın giyim koleksiyonu' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({ example: 'uuid-of-parent' })
  @IsString()
  @IsOptional()
  parentId?: string;

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

export class CategoryQueryDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Sadece aktif kategoriler',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Alt kategorileri dahil et',
  })
  @IsBoolean()
  @IsOptional()
  includeChildren?: boolean;

  @ApiPropertyOptional({
    example: 'uuid-of-parent',
    description: 'Belirli bir üst kategorinin alt kategorileri',
  })
  @IsString()
  @IsOptional()
  parentId?: string;
}
