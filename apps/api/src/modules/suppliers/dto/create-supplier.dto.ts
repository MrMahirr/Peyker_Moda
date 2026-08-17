import { IsString, IsOptional, IsBoolean, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({
    example: 'Örnek Tekstil A.Ş.',
    description: 'Tedarikçi firma veya kişi adı',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Ahmet Yılmaz',
    description: 'İletişim kurulacak kişi',
  })
  @IsString()
  @IsOptional()
  contactName?: string;

  @ApiPropertyOptional({
    example: 'info@ornektekstil.com',
    description: 'E-posta adresi',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: '+90 555 123 4567',
    description: 'Telefon numarası',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    example: 'Atatürk Mah. İstiklal Cad. No:1',
    description: 'Açık adres',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    example: '1234567890',
    description: 'Vergi Numarası / TC Kimlik',
  })
  @IsString()
  @IsOptional()
  taxNumber?: string;

  @ApiPropertyOptional({ example: 'Beyoğlu VD', description: 'Vergi Dairesi' })
  @IsString()
  @IsOptional()
  taxOffice?: string;

  @ApiPropertyOptional({ example: true, description: 'Aktif/Pasif durumu' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
