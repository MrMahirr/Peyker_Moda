import { IsString, IsOptional, IsNumber, IsEnum, IsUUID, IsInt, Min, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
    @ApiProperty({ description: 'Ürün Adı' })
    @IsString()
    productName: string;

    @ApiProperty({ description: 'Miktar' })
    @IsNumber()
    quantity: number;

    @ApiProperty({ description: 'Birim Fiyat' })
    @IsNumber()
    unitPrice: number;

    @ApiProperty({ description: 'KDV Oranı' })
    @IsNumber()
    taxRate: number;
}

export class CreateInvoiceDto {
    @ApiPropertyOptional({ description: 'Sipariş ID' })
    @IsOptional()
    @IsUUID()
    orderId?: string;

    @ApiPropertyOptional({ description: 'Vergi Kimlik No (Kurumsal)' })
    @IsOptional()
    @IsString()
    taxId?: string;

    @ApiPropertyOptional({ description: 'Vergi Dairesi (Kurumsal)' })
    @IsOptional()
    @IsString()
    taxOffice?: string;

    @ApiPropertyOptional({ description: 'Fatura Numarası' })
    @IsOptional()
    @IsString()
    invoiceNumber?: string;

    @ApiPropertyOptional({ description: 'Müşteri / Cari Adı' })
    @IsOptional()
    @IsString()
    customerName?: string;

    @ApiPropertyOptional({ description: 'Notlar' })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional({ description: 'Manuel Fatura Satırları', type: [InvoiceItemDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InvoiceItemDto)
    items?: InvoiceItemDto[];

    @ApiPropertyOptional({ description: 'Ara Toplam' })
    @IsOptional()
    @IsNumber()
    subtotal?: number;

    @ApiPropertyOptional({ description: 'KDV Toplamı' })
    @IsOptional()
    @IsNumber()
    tax?: number;

    @ApiPropertyOptional({ description: 'Genel Toplam' })
    @IsOptional()
    @IsNumber()
    total?: number;

    @ApiPropertyOptional({ description: 'Durum' })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiPropertyOptional({ description: 'Fatura Tipi' })
    @IsOptional()
    @IsString()
    type?: string;
}

export class UpdateInvoiceDto {
    @ApiPropertyOptional({ enum: InvoiceStatus, description: 'Fatura durumu' })
    @IsEnum(InvoiceStatus)
    @IsOptional()
    status?: InvoiceStatus;
}

export class InvoiceQueryDto {
    @ApiPropertyOptional({ example: 1 })
    @IsInt()
    @Min(1)
    @IsOptional()
    page?: number;

    @ApiPropertyOptional({ example: 50 })
    @IsInt()
    @Min(1)
    @IsOptional()
    limit?: number;

    @ApiPropertyOptional({ enum: InvoiceStatus })
    @IsEnum(InvoiceStatus)
    @IsOptional()
    status?: InvoiceStatus;

    @ApiPropertyOptional({ example: '2026-01-01' })
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @ApiPropertyOptional({ example: '2026-12-31' })
    @IsDateString()
    @IsOptional()
    endDate?: string;
}
