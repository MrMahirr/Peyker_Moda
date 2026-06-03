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
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { CustomerAnalyticsService } from './customer-analytics.service';
import { CurrentUser, Roles } from '../../common/decorators';
import { CustomerNotesService } from './customer-notes.service';
import { CustomersService } from './customers.service';
import {
    CreateCustomerDto,
    UpdateCustomerDto,
    CustomerQueryDto,
    CreateCustomerNoteDto,
} from './dto';

@ApiTags('Customers')
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class CustomersController {
    constructor(
        private readonly customersService: CustomersService,
        private readonly customerNotesService: CustomerNotesService,
        private readonly customerAnalyticsService: CustomerAnalyticsService,
    ) { }

    @Get()
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Musteri listesi' })
    @ApiResponse({ status: 200, description: 'Musteri listesi doner' })
    async findAll(@Query() query: CustomerQueryDto) {
        return this.customersService.findAll(query);
    }

    @Get('search')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Hizli musteri arama (autocomplete)' })
    async quickSearch(@Query('q') term: string, @Query('limit') limit?: number) {
        return this.customersService.quickSearch(term, limit);
    }

    @Get('phone/:phone')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Telefon ile musteri ara (POS icin)' })
    @ApiResponse({ status: 200, description: 'Musteri bulundu' })
    @ApiResponse({ status: 404, description: 'Musteri bulunamadi' })
    async findByPhone(@Param('phone') phone: string) {
        return this.customersService.findByPhone(phone);
    }

    @Get(':id')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Musteri detayi' })
    @ApiResponse({ status: 200, description: 'Musteri bulundu' })
    @ApiResponse({ status: 404, description: 'Musteri bulunamadi' })
    async findOne(@Param('id') id: string) {
        return this.customersService.findOne(id);
    }

    @Get(':id/orders')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Musteri siparisleri' })
    async findOrders(
        @Param('id') id: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.customersService.findOrders(id, page, limit);
    }

    @Get(':id/orders/:orderId/receipt')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Musteri siparis fisi' })
    async getOrderReceipt(
        @Param('id') customerId: string,
        @Param('orderId') orderId: string,
    ) {
        return this.customersService.getOrderReceipt(customerId, orderId);
    }

    @Get(':id/stats')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Musteri istatistikleri' })
    async getStats(@Param('id') id: string) {
        return this.customersService.getStats(id);
    }

    @Get(':id/analytics')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Musteri analiz verileri' })
    async getAnalytics(@Param('id') id: string) {
        return this.customerAnalyticsService.getAnalytics(id);
    }

    @Get(':id/notes')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Musteri etkilesim notlari' })
    async findNotes(@Param('id') id: string) {
        return this.customerNotesService.findAll(id);
    }

    @Post(':id/notes')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Musteri etkilesim notu ekle' })
    async createNote(
        @Param('id') id: string,
        @Body() createCustomerNoteDto: CreateCustomerNoteDto,
        @CurrentUser('id') userId: string,
    ) {
        return this.customerNotesService.create(id, createCustomerNoteDto, userId);
    }

    @Post()
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Yeni musteri olustur' })
    @ApiResponse({ status: 201, description: 'Musteri olusturuldu' })
    async create(@Body() createCustomerDto: CreateCustomerDto) {
        return this.customersService.create(createCustomerDto);
    }

    @Patch(':id')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Musteri guncelle' })
    @ApiResponse({ status: 200, description: 'Musteri guncellendi' })
    async update(
        @Param('id') id: string,
        @Body() updateCustomerDto: UpdateCustomerDto,
    ) {
        return this.customersService.update(id, updateCustomerDto);
    }

    @Delete(':id')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Musteri sil' })
    @ApiResponse({ status: 200, description: 'Musteri silindi' })
    async remove(@Param('id') id: string) {
        return this.customersService.remove(id);
    }
}
