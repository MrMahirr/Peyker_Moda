import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import {
  CarrierQueryDto,
  CreateCarrierDto,
  CreateShipmentDto,
  CreateShippingRateDto,
  ShipmentQueryDto,
  ShippingRateQueryDto,
  ShippingReportQueryDto,
  UpdateCarrierDto,
  UpdateShipmentStatusDto,
} from './dto';
import { ShippingService } from './shipping.service';

@ApiTags('Shipping')
@Controller('shipping')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get('carriers')
  @Roles('admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Kargo firmalarini listele' })
  @ApiResponse({ status: 200, description: 'Kargo firmalari listesi doner' })
  async getCarriers(@Query() query: CarrierQueryDto) {
    return this.shippingService.getCarriers(query);
  }

  @Post('carriers')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Kargo firmasi olustur' })
  async createCarrier(@Body() dto: CreateCarrierDto) {
    return this.shippingService.createCarrier(dto);
  }

  @Patch('carriers/:id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Kargo firmasi guncelle' })
  async updateCarrier(
    @Param('id') id: string,
    @Body() dto: UpdateCarrierDto,
  ) {
    return this.shippingService.updateCarrier(id, dto);
  }

  @Delete('carriers/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Kargo firmasi sil' })
  async deleteCarrier(@Param('id') id: string) {
    return this.shippingService.deleteCarrier(id);
  }

  @Get('shipments')
  @Roles('admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Gonderileri listele' })
  async getShipments(@Query() query: ShipmentQueryDto) {
    return this.shippingService.getShipments(query);
  }

  @Post('shipments')
  @Roles('admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Yeni gonderi olustur' })
  async createShipment(@Body() dto: CreateShipmentDto) {
    return this.shippingService.createShipment(dto);
  }

  @Patch('shipments/:id/status')
  @Roles('admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Gonderi durumunu guncelle' })
  async updateShipmentStatus(
    @Param('id') id: string,
    @Body() dto: UpdateShipmentStatusDto,
  ) {
    return this.shippingService.updateShipmentStatus(id, dto);
  }

  @Get('shipments/:id/track')
  @Roles('admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Gonderi takip gecmisini getir' })
  async trackShipment(@Param('id') id: string) {
    return this.shippingService.trackShipment(id);
  }

  @Get('rates')
  @Roles('admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Kargo tarifelerini listele' })
  async getRates(@Query() query: ShippingRateQueryDto) {
    return this.shippingService.getRates(query);
  }

  @Post('rates')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Kargo tarifesi olustur' })
  async createRate(@Body() dto: CreateShippingRateDto) {
    return this.shippingService.createRate(dto);
  }

  @Get('reports')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Teslimat raporu getir' })
  async getDeliveryReport(@Query() query: ShippingReportQueryDto) {
    return this.shippingService.getDeliveryReport(query);
  }
}
