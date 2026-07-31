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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, Roles } from '../../common/decorators';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import {
  AddLoyaltyPointsDto,
  CreateLoyaltyTierDto,
  UpdateLoyaltyTierDto,
} from './dto';
import { LoyaltyPointsService } from './loyalty-points.service';
import { LoyaltyTierService } from './loyalty-tier.service';

@ApiTags('Loyalty')
@Controller('loyalty')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class LoyaltyController {
  constructor(
    private readonly loyaltyTierService: LoyaltyTierService,
    private readonly loyaltyPointsService: LoyaltyPointsService,
  ) {}

  @Get('tiers')
  @Roles('admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Sadakat seviyelerini listele' })
  async getTiers() {
    return this.loyaltyTierService.findAll();
  }

  @Post('tiers')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Sadakat seviyesi olustur' })
  async createTier(@Body() dto: CreateLoyaltyTierDto) {
    return this.loyaltyTierService.create(dto);
  }

  @Patch('tiers/:id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Sadakat seviyesini guncelle' })
  async updateTier(
    @Param('id') id: string,
    @Body() dto: UpdateLoyaltyTierDto,
  ) {
    return this.loyaltyTierService.update(id, dto);
  }

  @Delete('tiers/:id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Sadakat seviyesini sil' })
  async deleteTier(@Param('id') id: string) {
    return this.loyaltyTierService.remove(id);
  }

  @Get('customers/:customerId')
  @Roles('admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Musteri sadakat puanlarini getir' })
  async getCustomerPoints(@Param('customerId') customerId: string) {
    return this.loyaltyPointsService.getCustomerPoints(customerId);
  }

  @Post('customers/:customerId/add')
  @Roles('admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Musteriye sadakat puani ekle' })
  async addPoints(
    @Param('customerId') customerId: string,
    @Body() dto: AddLoyaltyPointsDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.loyaltyPointsService.addPoints(customerId, dto, userId);
  }
}
