import {
    Controller,
    Get,
    Post,
    Patch,
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
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderQueryDto, AddPaymentDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Get()
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Sipariş listesi' })
    @ApiResponse({ status: 200, description: 'Sipariş listesi döner' })
    async findAll(@Query() query: OrderQueryDto) {
        return this.ordersService.findAll(query);
    }

    @Get(':id')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Sipariş detayı' })
    @ApiResponse({ status: 200, description: 'Sipariş bulundu' })
    @ApiResponse({ status: 404, description: 'Sipariş bulunamadı' })
    async findOne(@Param('id') id: string) {
        return this.ordersService.findOne(id);
    }

    @Post()
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Yeni sipariş oluştur' })
    @ApiResponse({ status: 201, description: 'Sipariş oluşturuldu' })
    async create(
        @Body() createOrderDto: CreateOrderDto,
        @CurrentUser('id') userId: string,
    ) {
        return this.ordersService.create(createOrderDto, userId);
    }

    @Patch(':id/status')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Sipariş durumu güncelle' })
    async updateStatus(
        @Param('id') id: string,
        @Body() updateStatusDto: UpdateOrderStatusDto,
        @CurrentUser('id') userId: string,
    ) {
        return this.ordersService.updateStatus(id, updateStatusDto, userId);
    }

    @Post(':id/ship')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Siparişi kargoya ver' })
    @ApiResponse({ status: 200, description: 'Sipariş kargoya verildi' })
    async ship(
        @Param('id') id: string,
    ) {
        return this.ordersService.shipOrder(id);
    }
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Sipariş iptal et' })
    async cancel(
        @Param('id') id: string,
        @Body('reason') reason: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.ordersService.cancel(id, reason, userId);
    }

    @Post(':id/payments')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Siparişe ödeme ekle' })
    async addPayment(
        @Param('id') id: string,
        @Body() paymentDto: AddPaymentDto,
        @CurrentUser('id') userId: string,
    ) {
        return this.ordersService.addPayment(id, paymentDto, userId);
    }
}
