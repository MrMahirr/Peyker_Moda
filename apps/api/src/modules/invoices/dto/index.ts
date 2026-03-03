import { IsString, IsOptional, IsNumber, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
