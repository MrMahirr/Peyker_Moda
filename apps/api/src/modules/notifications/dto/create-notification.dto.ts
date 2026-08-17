import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiProperty()
  @IsUUID()
  userId: string;
}

export class NotificationQueryDto {
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
