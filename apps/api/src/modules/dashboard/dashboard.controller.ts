import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Genel özet istatistikleri' })
  @ApiResponse({ status: 200, description: 'Dashboard özeti' })
  async getSummary(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getSummary(query);
  }

  @Get('sales-chart')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Satış grafiği verisi' })
  async getSalesChart(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getSalesChart(query);
  }

  @Get('top-products')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'En çok satan ürünler' })
  async getTopProducts(
    @Query() query: DashboardQueryDto,
    @Query('limit') limit?: number,
  ) {
    return this.dashboardService.getTopProducts(query, limit);
  }

  @Get('low-stock')
  @Roles('admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Kritik stok uyarısı' })
  async getLowStock(
    @Query('threshold') threshold?: number,
    @Query('limit') limit?: number,
  ) {
    return this.dashboardService.getLowStockProducts(threshold, limit);
  }

  @Get('recent-orders')
  @Roles('admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Son siparişler' })
  async getRecentOrders(
    @Query() query: DashboardQueryDto,
    @Query('limit') limit?: number,
  ) {
    return this.dashboardService.getRecentOrders(query, limit);
  }

  @Get('order-status')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Sipariş durumu dağılımı' })
  async getOrderStatusDistribution() {
    return this.dashboardService.getOrderStatusDistribution();
  }

  @Get('payment-methods')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Ödeme yöntemi dağılımı' })
  async getPaymentMethodDistribution(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getPaymentMethodDistribution(query);
  }

  @Get('top-customers')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'En iyi müşteriler' })
  async getTopCustomers(@Query('limit') limit?: number) {
    return this.dashboardService.getTopCustomers(limit);
  }

  @Get('search')
  @Roles('admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Global arama (Ürünler, Siparişler, Müşteriler)' })
  async globalSearch(@Query('q') q: string) {
    if (!q || q.trim().length < 2) {
      return { products: [], orders: [], customers: [] };
    }
    return this.dashboardService.globalSearch(q.trim());
  }
}
