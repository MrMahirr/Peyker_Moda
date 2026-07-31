import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class BannerQueryDto {
  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  includeInactive?: boolean;
}

export class CreateBannerDto {
  @ApiProperty({ example: 'Yaz Koleksiyonu' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Sezonun en trend parçaları' })
  @IsString()
  @IsOptional()
  subtitle?: string;

  @ApiProperty({ example: 'https://cdn.example.com/banner.jpg' })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiPropertyOptional({ example: '/koleksiyon/yaz' })
  @IsString()
  @IsOptional()
  linkUrl?: string;

  @ApiPropertyOptional({ example: 'Hemen Al' })
  @IsString()
  @IsOptional()
  ctaText?: string;

  @ApiPropertyOptional({ example: '/giyim' })
  @IsString()
  @IsOptional()
  ctaLink?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  position?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateBannerDto extends PartialType(CreateBannerDto) {}
