import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class PermissionInput {
  @ApiProperty({ example: 'products' })
  @IsString()
  resource: string;

  @ApiProperty({ example: 'create' })
  @IsString()
  action: string;
}

export class CreateRoleDto {
  @ApiProperty({ example: 'editor' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Editör' })
  @IsString()
  displayName: string;

  @ApiPropertyOptional({ example: 'İçerik düzenleme yetkisi' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [PermissionInput] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionInput)
  permissions?: PermissionInput[];
}
