import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MessagingAudienceType, MessagingChannel } from '../messaging.types';

export class CreateBulkMessageDto {
  @ApiProperty({ enum: MessagingChannel, example: MessagingChannel.EMAIL })
  @IsEnum(MessagingChannel)
  channel: MessagingChannel;

  @ApiProperty({ example: 'Yaz kampanyasi duyurusu' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Yeni sezon urunlerimiz yayinda.' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    enum: MessagingAudienceType,
    example: MessagingAudienceType.ALL_ACTIVE_CUSTOMERS,
  })
  @IsEnum(MessagingAudienceType)
  @IsOptional()
  audienceType?: MessagingAudienceType;
}
