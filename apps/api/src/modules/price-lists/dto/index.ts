import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  PriceListAdjustmentType,
  PriceListScopeType,
} from '../price-lists.types';

export class CreatePriceListDto {
  @ApiProperty({ example: 'VIP Ilkbahar Fiyat Listesi' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'VIP musteriler icin sezon ozel fiyatlari' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'customer-group-id' })
  @IsString()
  @IsOptional()
  customerGroupId?: string;

  @ApiProperty({
    enum: PriceListScopeType,
    example: PriceListScopeType.CATEGORY,
  })
  @IsEnum(PriceListScopeType)
  scopeType: PriceListScopeType;

  @ApiPropertyOptional({ example: 'category-id' })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'product-id' })
  @IsString()
  @IsOptional()
  productId?: string;

  @ApiProperty({
    enum: PriceListAdjustmentType,
    example: PriceListAdjustmentType.PERCENTAGE_DISCOUNT,
  })
  @IsEnum(PriceListAdjustmentType)
  adjustmentType: PriceListAdjustmentType;

  @ApiProperty({ example: 15 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  priority?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '2026-05-01T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  startsAt?: string;

  @ApiPropertyOptional({ example: '2026-05-31T23:59:59.000Z' })
  @IsDateString()
  @IsOptional()
  endsAt?: string;
}

export class UpdatePriceListDto extends PartialType(CreatePriceListDto) {}
