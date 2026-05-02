import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards';
import { GetReportQueryDto } from './dto/reports.dto';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {}

    @Get('sales')
    @ApiOperation({ summary: 'Satış ve ciro istatistiklerini getirir' })
    async getSalesStats(@Query() query: GetReportQueryDto) {
        return this.reportsService.getSalesStats(query.period);
    }

    @Get('products/performance')
    @ApiOperation({ summary: 'Ürün ve kategori performansını getirir' })
    async getProductPerformance(@Query() query: GetReportQueryDto) {
        return this.reportsService.getProductPerformance(query.period);
    }
}
