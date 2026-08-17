import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ example: 'Peyker Moda' })
  @IsString()
  @IsOptional()
  storeName?: string;

  @ApiPropertyOptional({ example: 'Istanbul, Turkiye' })
  @IsString()
  @IsOptional()
  storeAddress?: string;

  @ApiPropertyOptional({ example: '+90 555 123 4567' })
  @IsString()
  @IsOptional()
  storePhone?: string;

  @ApiPropertyOptional({ example: 'info@peykermoda.com' })
  @IsString()
  @IsOptional()
  storeEmail?: string;

  @ApiPropertyOptional({ example: 'TRY' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: 18 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  taxRate?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  lowStockThreshold?: number;

  @ApiPropertyOptional({ example: 'Peyker Moda' })
  @IsString()
  @IsOptional()
  receiptHeader?: string;

  @ApiPropertyOptional({ example: 'Tesekkur ederiz' })
  @IsString()
  @IsOptional()
  receiptFooter?: string;

  @ApiPropertyOptional({ example: 'Istanbul, Turkiye' })
  @IsString()
  @IsOptional()
  receiptAddress?: string;

  @ApiPropertyOptional({ example: '+90 555 123 4567' })
  @IsString()
  @IsOptional()
  receiptPhone?: string;

  @ApiPropertyOptional({ example: 18 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  receiptTaxRate?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  receiptShowLogo?: boolean;

  @ApiPropertyOptional({ example: 'logo.png' })
  @IsString()
  @IsOptional()
  storeLogo?: string;

  @ApiPropertyOptional({ example: 'cover.png' })
  @IsString()
  @IsOptional()
  storeCoverPhoto?: string;
}
