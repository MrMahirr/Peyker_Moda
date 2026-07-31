import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import {
    CreateCampaignDto,
    UpdateCampaignDto,
    CreateCouponDto,
    UpdateCouponDto,
    ValidateCouponDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';

@ApiTags('Campaigns & Coupons')
@Controller()
export class CampaignsController {
    constructor(private readonly campaignsService: CampaignsService) { }

    // ========== CAMPAIGNS ==========

    @Get('campaigns')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'manager')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Kampanya listesi' })
    async findAllCampaigns(@Query('includeInactive') includeInactive?: boolean) {
        return this.campaignsService.findAllCampaigns(includeInactive);
    }

    @Get('campaigns/active')
    @ApiOperation({ summary: 'Aktif kampanyalar' })
    async getActiveCampaigns() {
        return this.campaignsService.getActiveCampaigns();
    }

    @Get('campaigns/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'manager')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Kampanya detayı' })
    async findOneCampaign(@Param('id') id: string) {
        return this.campaignsService.findOneCampaign(id);
    }

    @Post('campaigns')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'manager')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Yeni kampanya oluştur' })
    async createCampaign(@Body() createCampaignDto: CreateCampaignDto) {
        return this.campaignsService.createCampaign(createCampaignDto);
    }

    @Patch('campaigns/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'manager')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Kampanya güncelle' })
    async updateCampaign(
        @Param('id') id: string,
        @Body() updateCampaignDto: UpdateCampaignDto,
    ) {
        return this.campaignsService.updateCampaign(id, updateCampaignDto);
    }

    @Delete('campaigns/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Kampanya sil' })
    async removeCampaign(@Param('id') id: string) {
        return this.campaignsService.removeCampaign(id);
    }

    // ========== COUPONS ==========

    @Get('coupons')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'manager')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Kupon listesi' })
    async findAllCoupons(@Query('includeInactive') includeInactive?: boolean) {
        return this.campaignsService.findAllCoupons(includeInactive);
    }

    @Get('coupons/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'manager')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Kupon detayı' })
    async findOneCoupon(@Param('id') id: string) {
        return this.campaignsService.findOneCoupon(id);
    }

    @Post('coupons')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'manager')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Yeni kupon oluştur' })
    async createCoupon(@Body() createCouponDto: CreateCouponDto) {
        return this.campaignsService.createCoupon(createCouponDto);
    }

    @Patch('coupons/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'manager')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Kupon güncelle' })
    async updateCoupon(
        @Param('id') id: string,
        @Body() updateCouponDto: UpdateCouponDto,
    ) {
        return this.campaignsService.updateCoupon(id, updateCouponDto);
    }

    @Delete('coupons/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Kupon sil' })
    async removeCoupon(@Param('id') id: string) {
        return this.campaignsService.removeCoupon(id);
    }

    @Post('coupons/validate')
    @ApiOperation({ summary: 'Kupon doğrula' })
    async validateCoupon(@Body() validateDto: ValidateCouponDto) {
        return this.campaignsService.validateCoupon(validateDto);
    }

    @Post('coupons/:code/use')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'manager', 'staff')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Kupon kullan' })
    async useCoupon(@Param('code') code: string) {
        return this.campaignsService.useCoupon(code);
    }
}
