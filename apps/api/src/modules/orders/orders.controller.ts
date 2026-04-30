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
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { OrderNotesService } from './order-notes.service';
import { OrdersService } from './orders.service';
import {
    CreateOrderDto,
    UpdateOrderStatusDto,
    OrderQueryDto,
    AddPaymentDto,
    CreateOrderNoteDto,
} from './dto';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class OrdersController {
    constructor(
        private readonly ordersService: OrdersService,
        private readonly orderNotesService: OrderNotesService,
    ) { }

    @Get()
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Siparis listesi' })
    @ApiResponse({ status: 200, description: 'Siparis listesi doner' })
    async findAll(@Query() query: OrderQueryDto) {
        return this.ordersService.findAll(query);
    }

    @Get(':id')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Siparis detayi' })
    @ApiResponse({ status: 200, description: 'Siparis bulundu' })
    @ApiResponse({ status: 404, description: 'Siparis bulunamadi' })
    async findOne(@Param('id') id: string) {
        return this.ordersService.findOne(id);
    }

    @Get(':id/notes')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Siparis notlarini getir' })
    async findNotes(@Param('id') id: string) {
        return this.orderNotesService.findAll(id);
    }

    @Post(':id/notes')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Siparise not ekle' })
    async createNote(
        @Param('id') id: string,
        @Body() createOrderNoteDto: CreateOrderNoteDto,
        @CurrentUser('id') userId: string,
    ) {
        return this.orderNotesService.create(id, createOrderNoteDto, userId);
    }

    @Post()
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Yeni siparis olustur' })
    @ApiResponse({ status: 201, description: 'Siparis olusturuldu' })
    async create(
        @Body() createOrderDto: CreateOrderDto,
        @CurrentUser('id') userId: string,
    ) {
        return this.ordersService.create(createOrderDto, userId);
    }

    @Patch(':id/status')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Siparis durumu guncelle' })
    async updateStatus(
        @Param('id') id: string,
        @Body() updateStatusDto: UpdateOrderStatusDto,
        @CurrentUser('id') userId: string,
    ) {
        return this.ordersService.updateStatus(id, updateStatusDto, userId);
    }

    @Post(':id/ship')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Siparisi kargoya ver' })
    @ApiResponse({ status: 200, description: 'Siparis kargoya verildi' })
    async ship(@Param('id') id: string) {
        return this.ordersService.shipOrder(id);
    }

    @Post(':id/cancel')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Siparis iptal et' })
    async cancel(
        @Param('id') id: string,
        @Body('reason') reason: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.ordersService.cancel(id, reason, userId);
    }

    @Post(':id/payments')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Siparise odeme ekle' })
    async addPayment(
        @Param('id') id: string,
        @Body() paymentDto: AddPaymentDto,
        @CurrentUser('id') userId: string,
    ) {
        return this.ordersService.addPayment(id, paymentDto, userId);
    }
}
