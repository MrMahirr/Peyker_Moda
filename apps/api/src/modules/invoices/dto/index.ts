import { IsString, IsOptional, IsNumber, IsEnum, IsUUID, IsInt, Min, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus } from '@prisma/client';

export class CreateInvoiceDto {
    @ApiProperty({ description: 'Sipariş ID' })
    @IsUUID()
    orderId: string;

    @ApiPropertyOptional({ description: 'Vergi Kimlik No (Kurumsal)' })
    @IsOptional()
    @IsString()
    taxId?: string;

    @ApiPropertyOptional({ description: 'Vergi Dairesi (Kurumsal)' })
    @IsOptional()
    @IsString()
    taxOffice?: string;
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
