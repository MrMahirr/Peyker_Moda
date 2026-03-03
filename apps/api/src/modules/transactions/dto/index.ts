import {
    IsString,
    IsOptional,
    IsNumber,
    IsInt,
    Min,
    IsEnum,
    IsDateString,
    IsUUID,
} from 'class-validator';
import { PaymentMethod, TransactionType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateTransactionDto {
    @ApiProperty({ enum: TransactionType, example: 'INCOME', description: 'İşlem tipi' })
    @IsEnum(TransactionType)
    type: TransactionType;

    @ApiProperty({ example: 500, description: 'Tutar' })
    @IsNumber()
    @Min(0)
    amount: number;

    @ApiProperty({ example: 'Satış geliri', description: 'Açıklama' })
    @IsString()
    description: string;

    @ApiPropertyOptional({ example: 'Satışlar', description: 'Kategori' })
    @IsString()
    @IsOptional()
    category?: string;

    @ApiPropertyOptional({ enum: PaymentMethod, example: 'CASH', description: 'Ödeme yöntemi' })
    @IsEnum(PaymentMethod)
    @IsOptional()
    paymentMethod?: PaymentMethod;

    @ApiPropertyOptional({ example: 'order-uuid', description: 'İlişkili sipariş ID' })
    @IsUUID()
    @IsOptional()
    orderId?: string;

    @ApiPropertyOptional({ example: '2026-02-06', description: 'İşlem tarihi' })
    @IsDateString()
    @IsOptional()
    transactionDate?: string;

    @ApiPropertyOptional({ example: 'Fatura no: 12345' })
    @IsString()
    @IsOptional()
    reference?: string;

    @ApiPropertyOptional({ example: 'Ek notlar' })
    @IsString()
    @IsOptional()
    notes?: string;
}

export class TransactionQueryDto {
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

    @ApiPropertyOptional({ enum: TransactionType })
    @IsEnum(TransactionType)
    @IsOptional()
    type?: TransactionType;

    @ApiPropertyOptional({ example: 'Satışlar' })
    @IsString()
    @IsOptional()
    category?: string;

    @ApiPropertyOptional({ example: '2026-01-01' })
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @ApiPropertyOptional({ example: '2026-12-31' })
    @IsDateString()
    @IsOptional()
    endDate?: string;
}

export class ReportQueryDto {
    @ApiProperty({ example: '2026-01-01', description: 'Başlangıç tarihi' })
    @IsDateString()
    startDate: string;

    @ApiProperty({ example: '2026-01-31', description: 'Bitiş tarihi' })
    @IsDateString()
    endDate: string;

    @ApiPropertyOptional({ example: 'day', description: 'Gruplama: day, week, month' })
    @IsString()
    @IsOptional()
    groupBy?: 'day' | 'week' | 'month';
}

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) { }
