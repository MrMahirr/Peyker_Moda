import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerGroupDto {
  @ApiProperty({ example: 'VIP Müşteriler', description: 'Grup adı' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'En değerli müşterilerimiz',
    description: 'Açıklama',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 10, description: 'İndirim yüzdesi (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discountPercent?: number;
}

export class UpdateCustomerGroupDto {
  @ApiPropertyOptional({ example: 'VIP Müşteriler' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'En değerli müşterilerimiz' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discountPercent?: number;
}
