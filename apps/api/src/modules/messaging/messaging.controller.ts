import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, Roles } from '../../common/decorators';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { CreateBulkMessageDto } from './dto';
import { MessagingService } from './messaging.service';

@ApiTags('Messaging')
@Controller('messaging')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get('channels')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Mesaj kanallarinin durumunu getir' })
  async getChannelStatuses() {
    return this.messagingService.getChannelStatuses();
  }

  @Get('bulk-messages')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Toplu mesaj gecmisini getir' })
  async getBulkMessages() {
    return this.messagingService.getBulkMessages();
  }

  @Post('bulk-messages')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Toplu mesaj talebi olustur' })
  async createBulkMessage(
    @Body() dto: CreateBulkMessageDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.messagingService.createBulkMessage(dto, userId);
  }
}
