import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    UseGuards,
    Query,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { PosService } from './pos.service';
import { PosSaleDto, HoldSaleDto, OpenSessionDto, CloseSessionDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';

@ApiTags('POS')
@Controller('pos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class PosController {
    constructor(private readonly posService: PosService) { }

    @Get('products')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'POS ürünlerini getir (Varyantları liste olarak döndürür)' })
    async getProducts(
        @Query('search') search?: string,
        @Query('categoryId') categoryId?: string
    ) {
        return this.posService.getProducts(search, categoryId);
    }

    @Get('products/barcode/:barcode')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Barkoda göre POS ürünü getir' })
    async getProductByBarcode(@Param('barcode') barcode: string) {
        return this.posService.getProductByBarcode(barcode);
    }

    @Post('sale')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'POS Satış işlemi' })
    @ApiResponse({ status: 201, description: 'Satış tamamlandı' })
    async processSale(
        @Body() saleDto: PosSaleDto,
        @CurrentUser('id') userId: string,
    ) {
        return this.posService.processSale(saleDto, userId);
    }

    @Post('hold')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Satışı beklet' })
    async holdSale(
        @Body() holdDto: HoldSaleDto,
        @CurrentUser('id') userId: string,
    ) {
        return this.posService.holdSale(holdDto, userId);
    }

    @Get('queue')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Bekleyen satışlar' })
    async getHeldSales(@CurrentUser('id') userId: string) {
        return this.posService.getHeldSales();
    }

    @Get('queue/:id')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Bekleyen satış detayı' })
    async getHeldSale(@Param('id') id: string) {
        return this.posService.getHeldSale(id);
    }

    @Delete('queue/:id')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Bekleyen satışı iptal et' })
    async cancelHeldSale(@Param('id') id: string) {
        return this.posService.cancelHeldSale(id);
    }

    @Post('sessions/open')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Kasa oturumu aç' })
    async openSession(
        @Body() openDto: OpenSessionDto,
        @CurrentUser('id') userId: string,
    ) {
        return this.posService.openSession(openDto, userId);
    }

    @Post('sessions/:id/close')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Kasa oturumu kapat' })
    async closeSession(
        @Param('id') id: string,
        @Body() closeDto: CloseSessionDto,
        @CurrentUser('id') userId: string,
    ) {
        return this.posService.closeSession(id, closeDto, userId);
    }

    @Get('sessions/:id/report')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Oturum raporu' })
    async getSessionReport(@Param('id') id: string) {
        return this.posService.getSessionReport(id);
    }
}
