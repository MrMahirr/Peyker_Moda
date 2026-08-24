import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderSource, PaymentMethod, ReturnStatus } from '@prisma/client';

export class ReturnItemDto {
  @ApiPropertyOptional({ example: 'order-item-uuid' })
  @IsUUID()
  @IsOptional()
  orderItemId?: string;

  @ApiProperty({ example: 'variant-uuid' })
  @IsUUID()
  variantId: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ example: 'Size did not fit' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  reason?: string;
}

export class CreateReturnDto {
  @ApiProperty({
    example: 'order-uuid-or-order-number',
    description: 'Order id or order number',
  })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ example: 'Customer requested a return' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ example: 'Package opened, product unused' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  notes?: string;

  @ApiProperty({ type: [ReturnItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReturnItemDto)
  items: ReturnItemDto[];
}

export class CustomerReturnItemDto {
  @ApiProperty({ example: 'variant-uuid' })
  @IsUUID()
  variantId: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ example: 'Size did not fit' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  reason?: string;
}

export class CreateCustomerReturnDto {
  @ApiProperty({ example: 'Size did not fit' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ example: 'Customer return request note' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  notes?: string;

  @ApiProperty({ type: [CustomerReturnItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CustomerReturnItemDto)
  items: CustomerReturnItemDto[];
}

export class ApprovedReturnItemDto {
  @ApiPropertyOptional({ example: 'order-item-uuid' })
  @IsUUID()
  @IsOptional()
  orderItemId?: string;

  @ApiProperty({ example: 'variant-uuid' })
  @IsUUID()
  variantId: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ example: 'Approved after inspection' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  reason?: string;
}

export class ApproveReturnDto {
  @ApiPropertyOptional({
    type: [ApprovedReturnItemDto],
    description: 'Optional subset/quantity override for approved return lines',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ApprovedReturnItemDto)
  @IsOptional()
  approvedItems?: ApprovedReturnItemDto[];

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  restock?: boolean;

  @ApiPropertyOptional({ example: 'Approved after product inspection' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  notes?: string;
}

export class RejectReturnDto {
  @ApiProperty({ example: 'Return period expired' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class RefundReturnDto {
  @ApiProperty({ enum: PaymentMethod, example: 'CASH' })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiPropertyOptional({
    example: 299.9,
    description:
      'Accepted for client display confirmation only; backend uses the calculated return amount',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ example: 'BANK-REF-123' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  reference?: string;

  @ApiPropertyOptional({ example: 'Refund completed in store' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  restock?: boolean;
}

export class CompleteReturnDto {
  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  restock?: boolean;

  @ApiPropertyOptional({ example: 'Items returned to shelf stock' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  notes?: string;
}

export class ReturnQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ enum: ReturnStatus })
  @IsEnum(ReturnStatus)
  @IsOptional()
  status?: ReturnStatus;

  @ApiPropertyOptional({ enum: OrderSource })
  @IsEnum(OrderSource)
  @IsOptional()
  source?: OrderSource;

  @ApiPropertyOptional({ example: '26082404321' })
  @IsString()
  @IsOptional()
  orderNumber?: string;

  @ApiPropertyOptional({
    example: '26082404321 or customer phone',
    description: 'Search by order number or customer identity fields',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 'customer-uuid' })
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsDateString()
  @IsOptional()
  dateTo?: string;
}
