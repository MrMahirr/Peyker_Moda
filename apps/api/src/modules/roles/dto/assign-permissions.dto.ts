import { IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class PermissionInput {
  @ApiProperty({ example: 'products' })
  @IsString()
  resource: string;

  @ApiProperty({ example: 'create' })
  @IsString()
  action: string;
}

export class AssignPermissionsDto {
  @ApiProperty({ type: [PermissionInput] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionInput)
  permissions: PermissionInput[];
}
