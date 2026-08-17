import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { CreatePriceListDto, UpdatePriceListDto } from './dto';
import { PriceListsService } from './price-lists.service';

@ApiTags('Price Lists')
@Controller('price-lists')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class PriceListsController {
  constructor(private readonly priceListsService: PriceListsService) {}

  @Get('metadata')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Fiyat listesi referans verilerini getir' })
  async getMetadata() {
    return this.priceListsService.getMetadata();
  }

  @Get()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Fiyat listelerini getir' })
  async findAll() {
    return this.priceListsService.findAll();
  }

  @Post()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Fiyat listesi olustur' })
  async create(@Body() dto: CreatePriceListDto) {
    return this.priceListsService.create(dto);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Fiyat listesi guncelle' })
  async update(@Param('id') id: string, @Body() dto: UpdatePriceListDto) {
    return this.priceListsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Fiyat listesi sil' })
  async remove(@Param('id') id: string) {
    return this.priceListsService.remove(id);
  }
}
