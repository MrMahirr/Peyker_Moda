import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    Delete,
    Patch,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, UpdateTransactionDto, TransactionQueryDto, ReportQueryDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';

@ApiTags('Transactions & Reports')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    // ========== TRANSACTIONS ==========

    @Get('transactions')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'İşlem listesi' })
    @ApiResponse({ status: 200, description: 'İşlem listesi döner' })
    async findAll(@Query() query: TransactionQueryDto) {
        return this.transactionsService.findAll(query);
    }

    @Get('transactions/:id')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'İşlem detayı' })
    async findOne(@Param('id') id: string) {
        return this.transactionsService.findOne(id);
    }

    @Post('transactions')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Yeni gelir/gider kaydı' })
    @ApiResponse({ status: 201, description: 'İşlem oluşturuldu' })
    async create(
        @Body() createTransactionDto: CreateTransactionDto,
        @CurrentUser('id') userId: string,
    ) {
        return this.transactionsService.create(createTransactionDto, userId);
    }


    @Patch('transactions/:id')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'İşlem güncelle' })
    @ApiResponse({ status: 200, description: 'İşlem güncellendi' })
    async update(
        @Param('id') id: string,
        @Body() updateTransactionDto: UpdateTransactionDto,
    ) {
        return this.transactionsService.update(id, updateTransactionDto);
    }

    @Delete('transactions/:id')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'İşlem sil' })
    @ApiResponse({ status: 200, description: 'İşlem silindi' })
    async remove(@Param('id') id: string) {
        return this.transactionsService.remove(id);
    }

    // ========== REPORTS ==========

    @Get('transactions/reports/financial')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Finansal Rapor (Gelir/Gider/Kar)' })
    async getFinancialReport(@Query() query: ReportQueryDto) {
        return this.transactionsService.getFinancialReport(query);
    }

    @Get('reports/summary')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Özet rapor (gelir/gider)' })
    async getSummary(@Query() query: ReportQueryDto) {
        return this.transactionsService.getSummary(query);
    }

    @Get('reports/sales')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Satış raporu' })
    async getSalesReport(@Query() query: ReportQueryDto) {
        return this.transactionsService.getSalesReport(query);
    }

    @Get('reports/products')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Ürün raporu' })
    async getProductsReport(@Query() query: ReportQueryDto) {
        return this.transactionsService.getProductsReport(query);
    }

    @Get('reports/z-report/:date')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Z Raporu (günlük kasa kapanış)' })
    async getZReport(@Param('date') date: string) {
        return this.transactionsService.getZReport(date);
    }
}
