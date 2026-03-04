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
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerQueryDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';

@ApiTags('Customers')
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Get()
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Müşteri listesi' })
    @ApiResponse({ status: 200, description: 'Müşteri listesi döner' })
    async findAll(@Query() query: CustomerQueryDto) {
        return this.customersService.findAll(query);
    }

    @Get('search')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Hızlı müşteri arama (autocomplete)' })
    async quickSearch(@Query('q') term: string, @Query('limit') limit?: number) {
        return this.customersService.quickSearch(term, limit);
    }

    @Get('phone/:phone')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Telefon ile müşteri ara (POS için)' })
    @ApiResponse({ status: 200, description: 'Müşteri bulundu' })
    @ApiResponse({ status: 404, description: 'Müşteri bulunamadı' })
    async findByPhone(@Param('phone') phone: string) {
        return this.customersService.findByPhone(phone);
    }

    @Get(':id')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Müşteri detayı' })
    @ApiResponse({ status: 200, description: 'Müşteri bulundu' })
    @ApiResponse({ status: 404, description: 'Müşteri bulunamadı' })
    async findOne(@Param('id') id: string) {
        return this.customersService.findOne(id);
    }

    @Get(':id/orders')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Müşteri siparişleri' })
    async findOrders(
        @Param('id') id: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.customersService.findOrders(id, page, limit);
    }

    @Get(':id/stats')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Müşteri istatistikleri' })
    async getStats(@Param('id') id: string) {
        return this.customersService.getStats(id);
    }

    @Post()
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Yeni müşteri oluştur' })
    @ApiResponse({ status: 201, description: 'Müşteri oluşturuldu' })
    async create(@Body() createCustomerDto: CreateCustomerDto) {
        return this.customersService.create(createCustomerDto);
    }

    @Patch(':id')
    @Roles('admin', 'manager', 'staff')
    @ApiOperation({ summary: 'Müşteri güncelle' })
    @ApiResponse({ status: 200, description: 'Müşteri güncellendi' })
    async update(
        @Param('id') id: string,
        @Body() updateCustomerDto: UpdateCustomerDto,
    ) {
        return this.customersService.update(id, updateCustomerDto);
    }

    @Delete(':id')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Müşteri sil' })
    @ApiResponse({ status: 200, description: 'Müşteri silindi' })
    async remove(@Param('id') id: string) {
        return this.customersService.remove(id);
    }
}
