import { IsString, IsOptional, IsNumber, IsInt, Min, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVariantDto {
    @ApiPropertyOptional({ example: 'SKU-1234-M-RED', description: 'Varyant SKU' })
    @IsString()
    @IsOptional()
    sku?: string;

    @ApiPropertyOptional({ example: '8697123456790', description: 'Varyant barkodu' })
    @IsString()
    @IsOptional()
    barcode?: string;

    @ApiPropertyOptional({ example: 'M', description: 'Beden' })
    @IsString()
    @IsOptional()
    size?: string;

    @ApiPropertyOptional({ example: 'Kırmızı', description: 'Renk' })
    @IsString()
    @IsOptional()
    color?: string;

    @ApiPropertyOptional({ example: '#FF0000', description: 'Renk kodu (hex)' })
    @IsString()
    @IsOptional()
    colorCode?: string;

    @ApiPropertyOptional({ example: 50, description: 'Stok miktarı' })
    @IsInt()
    @Min(0)
    @IsOptional()
    stock?: number;

    @ApiPropertyOptional({ example: 499.99, description: 'Varyant fiyatı (ürün fiyatından farklıysa)' })
    @IsNumber()
    @Min(0)
    @IsOptional()
    price?: number;
}

export class UpdateVariantDto {
    @ApiPropertyOptional({ example: 'SKU-1234-M-RED' })
    @IsString()
    @IsOptional()
    sku?: string;

    @ApiPropertyOptional({ example: '8697123456790' })
    @IsString()
    @IsOptional()
    barcode?: string;

    @ApiPropertyOptional({ example: 'M' })
    @IsString()
    @IsOptional()
    size?: string;

    @ApiPropertyOptional({ example: 'Kırmızı' })
    @IsString()
    @IsOptional()
    color?: string;

    @ApiPropertyOptional({ example: '#FF0000' })
    @IsString()
    @IsOptional()
    colorCode?: string;

    @ApiPropertyOptional({ example: 50 })
    @IsInt()
    @Min(0)
    @IsOptional()
    stock?: number;

    @ApiPropertyOptional({ example: 499.99 })
    @IsNumber()
    @Min(0)
    @IsOptional()
    price?: number;
}
