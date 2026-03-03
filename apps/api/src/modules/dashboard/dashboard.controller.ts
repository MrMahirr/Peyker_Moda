import {
    Controller,
    Get,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { UserRole } from '@prisma/client';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('summary')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Genel özet istatistikleri' })
    @ApiResponse({ status: 200, description: 'Dashboard özeti' })
    async getSummary(@Query() query: DashboardQueryDto) {
        return this.dashboardService.getSummary(query);
    }

    @Get('sales-chart')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Satış grafiği verisi' })
    async getSalesChart(@Query() query: DashboardQueryDto) {
        return this.dashboardService.getSalesChart(query);
    }

    @Get('top-products')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'En çok satan ürünler' })
    async getTopProducts(@Query('limit') limit?: number) {
        return this.dashboardService.getTopProducts(limit);
    }

    @Get('low-stock')
    @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
    @ApiOperation({ summary: 'Kritik stok uyarısı' })
    async getLowStock(
        @Query('threshold') threshold?: number,
        @Query('limit') limit?: number,
    ) {
        return this.dashboardService.getLowStockProducts(threshold, limit);
    }

    @Get('recent-orders')
    @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
    @ApiOperation({ summary: 'Son siparişler' })
    async getRecentOrders(@Query('limit') limit?: number) {
        return this.dashboardService.getRecentOrders(limit);
    }

    @Get('order-status')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Sipariş durumu dağılımı' })
    async getOrderStatusDistribution() {
        return this.dashboardService.getOrderStatusDistribution();
    }

    @Get('payment-methods')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Ödeme yöntemi dağılımı' })
    async getPaymentMethodDistribution(@Query() query: DashboardQueryDto) {
        return this.dashboardService.getPaymentMethodDistribution(query);
    }

    @Get('top-customers')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'En iyi müşteriler' })
    async getTopCustomers(@Query('limit') limit?: number) {
        return this.dashboardService.getTopCustomers(limit);
    }
}
