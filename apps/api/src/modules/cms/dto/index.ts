import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateBlogPostDto {
  @ApiProperty({ example: '2026 Yaz Trendleri' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: '2026-yaz-trendleri' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ example: 'Yeni sezonun one cikan detaylari.' })
  @IsString()
  @IsNotEmpty()
  excerpt: string;

  @ApiProperty({ example: 'Uzun blog icerigi...' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/blog.jpg' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

export class UpdateBlogPostDto extends PartialType(CreateBlogPostDto) {}

export class CreateCmsPageDto {
  @ApiProperty({ example: 'Hakkimizda' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'hakkimizda' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ example: 'Sayfa icerigi...' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;
}

export class UpdateCmsPageDto extends PartialType(CreateCmsPageDto) {}

export class CreateFaqItemDto {
  @ApiProperty({ example: 'Kargo suresi ne kadar?' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ example: 'Siparisler 1-3 is gunu icinde kargolanir.' })
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiPropertyOptional({ example: 'Kargo' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateFaqItemDto extends PartialType(CreateFaqItemDto) {}
