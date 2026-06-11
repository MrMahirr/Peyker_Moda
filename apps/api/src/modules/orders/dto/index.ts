import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsInt,
  Min,
  IsUUID,
  IsEnum,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  OrderSource,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '@prisma/client';

export class OrderItemDto {
  @ApiProperty({ example: 'variant-uuid', description: 'Varyant ID' })
  @IsUUID()
  variantId: string;

  @ApiProperty({ example: 2, description: 'Miktar' })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 199.99, description: 'Birim fiyat' })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ example: 10, description: 'İndirim tutarı' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;
}

export class CreateOrderDto {
  @ApiPropertyOptional({
    example: 'customer-uuid',
    description: 'Müşteri ID (opsiyonel)',
  })
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @ApiProperty({ type: [OrderItemDto], description: 'Sipariş kalemleri' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({
    example: 'Kapıda ödeme yapılacak',
    description: 'Sipariş notu',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: 50, description: 'Genel indirim tutarı' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountAmount?: number;

  @ApiPropertyOptional({ example: 'SUMMER20', description: 'Kupon kodu' })
  @IsString()
  @IsOptional()
  couponCode?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    example: 'CONFIRMED',
    description: 'Yeni durum',
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiPropertyOptional({
    example: 'Ürünler kontrol edildi',
    description: 'Durum notu',
  })
  @IsString()
  @IsOptional()
  note?: string;
}

export class OrderQueryDto {
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

  @ApiPropertyOptional({
    example: 'ORD-2026',
    description: 'Sipariş numarası ile arama',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 'customer-uuid' })
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiPropertyOptional({ enum: OrderSource })
  @IsEnum(OrderSource)
  @IsOptional()
  source?: OrderSource;

  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'Başlangıç tarihi',
  })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31', description: 'Bitiş tarihi' })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: 'createdAt' })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ example: 'desc' })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}

export class AddPaymentDto {
  @ApiProperty({
    enum: PaymentMethod,
    example: 'CASH',
    description: 'Ödeme yöntemi',
  })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ example: 500, description: 'Ödeme tutarı' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ example: 'Nakit ödendi', description: 'Ödeme notu' })
  @IsString()
  @IsOptional()
  note?: string;
}

export class CreateOrderNoteDto {
  @ApiProperty({ example: 'Musteri teslimat saati icin tekrar aranacak.' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isInternal?: boolean;
}
