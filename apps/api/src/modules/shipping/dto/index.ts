import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CarrierCode, ShipmentStatus } from '@prisma/client';

export class CarrierQueryDto {
  @ApiPropertyOptional({ enum: CarrierCode })
  @IsEnum(CarrierCode)
  @IsOptional()
  code?: CarrierCode;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateCarrierDto {
  @ApiProperty({ example: 'Yurtici Kargo' })
  @IsString()
  name: string;

  @ApiProperty({ enum: CarrierCode, example: CarrierCode.YURTICI })
  @IsEnum(CarrierCode)
  code: CarrierCode;

  @ApiPropertyOptional({ example: 'secret-api-key' })
  @IsString()
  @IsOptional()
  apiKey?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsString()
  @IsOptional()
  logo?: string;
}

export class UpdateCarrierDto {
  @ApiPropertyOptional({ example: 'Yurtici Kargo' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ enum: CarrierCode, example: CarrierCode.YURTICI })
  @IsEnum(CarrierCode)
  @IsOptional()
  code?: CarrierCode;

  @ApiPropertyOptional({ example: 'secret-api-key' })
  @IsString()
  @IsOptional()
  apiKey?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsString()
  @IsOptional()
  logo?: string;
}

export class ShipmentQueryDto {
  @ApiPropertyOptional({ enum: ShipmentStatus })
  @IsEnum(ShipmentStatus)
  @IsOptional()
  status?: ShipmentStatus;
}

export class CreateShipmentDto {
  @ApiProperty({ example: 'order-id' })
  @IsString()
  orderId: string;

  @ApiProperty({ example: 'carrier-id' })
  @IsUUID()
  carrierId: string;

  @ApiProperty({ example: 'Ayse Yilmaz' })
  @IsString()
  recipientName: string;

  @ApiProperty({ example: '5551234567' })
  @IsString()
  recipientPhone: string;

  @ApiProperty({ example: 'Istanbul / Kadikoy' })
  @IsString()
  recipientAddress: string;

  @ApiPropertyOptional({ example: 1.5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({ example: 2.1 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  desi?: number;

  @ApiPropertyOptional({ example: 120 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  shippingCost?: number;

  @ApiPropertyOptional({ enum: ShipmentStatus, example: ShipmentStatus.PREPARING })
  @IsEnum(ShipmentStatus)
  @IsOptional()
  status?: ShipmentStatus;

  @ApiPropertyOptional({ example: '2026-05-02T12:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  estimatedDelivery?: string;
}

export class UpdateShipmentStatusDto {
  @ApiProperty({ enum: ShipmentStatus, example: ShipmentStatus.IN_TRANSIT })
  @IsEnum(ShipmentStatus)
  status: ShipmentStatus;
}

export class ShippingRateQueryDto {
  @ApiPropertyOptional({ example: 'carrier-id' })
  @IsUUID()
  @IsOptional()
  carrierId?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateShippingRateDto {
  @ApiProperty({ example: 'carrier-id' })
  @IsUUID()
  carrierId: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  minWeight: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(0)
  maxWeight: number;

  @ApiProperty({ example: 'ISTANBUL_ICI' })
  @IsString()
  zone: string;

  @ApiProperty({ example: 89.9 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class ShippingReportQueryDto {
  @ApiProperty({ example: '2026-04-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-04-30' })
  @IsDateString()
  endDate: string;
}
