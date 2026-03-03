import {
    IsString,
    IsOptional,
    IsNumber,
    IsInt,
    Min,
    IsUUID,
    IsEnum,
    IsArray,
    ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class PosItemDto {
    @ApiProperty({ example: 'variant-uuid' })
    @IsUUID()
    variantId: string;

    @ApiProperty({ example: 1 })
    @IsInt()
    @Min(1)
    quantity: number;

    @ApiProperty({ example: 199.99 })
    @IsNumber()
    @Min(0)
    price: number;

    @ApiPropertyOptional({ example: 10 })
    @IsNumber()
    @Min(0)
    @IsOptional()
    discount?: number;
}

export class PosPaymentDto {
    @ApiProperty({ enum: PaymentMethod, example: 'CASH' })
    @IsEnum(PaymentMethod)
    method: PaymentMethod;

    @ApiProperty({ example: 500 })
    @IsNumber()
    @Min(0)
    amount: number;
}

export class PosSaleDto {
    @ApiPropertyOptional({ example: 'customer-uuid' })
    @IsUUID()
    @IsOptional()
    customerId?: string;

    @ApiProperty({ type: [PosItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PosItemDto)
    items: PosItemDto[];

    @ApiProperty({ type: [PosPaymentDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PosPaymentDto)
    payments: PosPaymentDto[];

    @ApiPropertyOptional({ example: 20 })
    @IsNumber()
    @Min(0)
    @IsOptional()
    discountAmount?: number;

    @ApiPropertyOptional({ example: 'SUMMER20' })
    @IsString()
    @IsOptional()
    couponCode?: string;

    @ApiPropertyOptional({ example: 'Müşteri hediye paketi istedi' })
    @IsString()
    @IsOptional()
    notes?: string;
}

export class HoldSaleDto {
    @ApiPropertyOptional({ example: 'customer-uuid' })
    @IsUUID()
    @IsOptional()
    customerId?: string;

    @ApiProperty({ type: [PosItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PosItemDto)
    items: PosItemDto[];

    @ApiPropertyOptional({ example: 'Müşteri bankaya gidecek' })
    @IsString()
    @IsOptional()
    notes?: string;
}

export class OpenSessionDto {
    @ApiProperty({ example: 1000, description: 'Açılış kasası tutarı' })
    @IsNumber()
    @Min(0)
    openingBalance: number;

    @ApiPropertyOptional({ example: 'Günlük satış başlangıcı' })
    @IsString()
    @IsOptional()
    notes?: string;
}

export class CloseSessionDto {
    @ApiProperty({ example: 5000, description: 'Kapanış kasası tutarı (sayım)' })
    @IsNumber()
    @Min(0)
    closingBalance: number;

    @ApiPropertyOptional({ example: 'Normal gün, eksik yok' })
    @IsString()
    @IsOptional()
    notes?: string;
}
