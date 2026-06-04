import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DashboardQueryDto } from './dto';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Genel özet istatistikleri ve trendler
   */
  async getSummary(query: DashboardQueryDto) {
    const dateFilter = this.getDateFilter(query);
    const startOfToday = this.getStartOfDay();
    const startOfYesterday = new Date(
      startOfToday.getTime() - 24 * 60 * 60 * 1000,
    );

    const startOfThisWeek = new Date(startOfToday);
    startOfThisWeek.setDate(
      startOfToday.getDate() -
        startOfToday.getDay() +
        (startOfToday.getDay() === 0 ? -6 : 1),
    );
    const startOfLastWeek = new Date(
      startOfThisWeek.getTime() - 7 * 24 * 60 * 60 * 1000,
    );

    const [
      totalOrders,
      totalRevenue,
      totalCustomers,
      filteredCustomers,
      totalProducts,
      pendingOrders,
      todaySales,
      yesterdaySales,
      thisWeekCustomers,
      lastWeekCustomers,
    ] = await Promise.all([
      // Toplam sipariş
      this.prisma.order.count({
        where: {
          createdAt: dateFilter,
          status: { not: OrderStatus.CANCELLED },
        },
      }),
      // Toplam gelir
      this.prisma.order.aggregate({
        where: {
          createdAt: dateFilter,
          status: { not: OrderStatus.CANCELLED },
          paymentStatus: PaymentStatus.COMPLETED,
        },
        _sum: { totalAmount: true },
      }),
      // Toplam müşteri (Tüm zamanlar)
      this.prisma.customer.count({
        where: { isActive: true },
      }),
      // Seçili tarih aralığında yeni müşteri
      this.prisma.customer.count({
        where: { createdAt: dateFilter },
      }),
      // Toplam ürün
      this.prisma.product.count({
        where: { isActive: true },
      }),
      // Bekleyen siparişler
      this.prisma.order.count({
        where: { status: OrderStatus.PENDING },
      }),
      // Bugünün satışları
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfToday },
          status: { not: OrderStatus.CANCELLED },
        },
        _sum: { totalAmount: true },
        _count: true,
      }),
      // Dünün satışları
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfYesterday, lt: startOfToday },
          status: { not: OrderStatus.CANCELLED },
        },
        _sum: { totalAmount: true },
        _count: true,
      }),
      // Bu hafta yeni müşteri
      this.prisma.customer.count({
        where: { createdAt: { gte: startOfThisWeek } },
      }),
      // Geçen hafta yeni müşteri
      this.prisma.customer.count({
        where: { createdAt: { gte: startOfLastWeek, lt: startOfThisWeek } },
      }),
    ]);

    const calcTrend = (current: number, prev: number) => {
      if (prev === 0) return current > 0 ? 100 : 0;
      return Number((((current - prev) / prev) * 100).toFixed(1));
    };

    const todayAmount = Number(todaySales._sum.totalAmount || 0);
    const yesterdayAmount = Number(yesterdaySales._sum.totalAmount || 0);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalCustomers,
      filteredCustomers,
      totalProducts,
      pendingOrders,
      newCustomersThisWeek: thisWeekCustomers,
      trends: {
        salesAmount: calcTrend(todayAmount, yesterdayAmount),
        salesCount: calcTrend(todaySales._count, yesterdaySales._count),
        newCustomers: calcTrend(thisWeekCustomers, lastWeekCustomers),
      },
      todaySales: {
        count: todaySales._count,
        amount: todayAmount,
      },
    };
  }

  /**
   * Satış grafiği verisi
   */
  async getSalesChart(query: DashboardQueryDto) {
    const dateFilter = this.getDateFilter(query);
    const groupBy = query.groupBy || 'day';

    // Son 30 gün için satış verisi
    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: dateFilter,
        status: { not: OrderStatus.CANCELLED },
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Gider verisi
    const expenses = await this.prisma.transaction.findMany({
      where: {
        transactionDate: dateFilter,
        type: 'EXPENSE',
      },
      select: {
        transactionDate: true,
        amount: true,
      },
    });

    // Tarihe göre grupla
    const salesByDate = new Map<
      string,
      { count: number; amount: number; expense: number }
    >();

    // Eksik günleri 0 ile doldur (sadece day gruplaması için)
    if (groupBy === 'day') {
      const start = dateFilter.gte
        ? new Date(dateFilter.gte)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = dateFilter.lte ? new Date(dateFilter.lte) : new Date();
      const curr = new Date(start);
      while (curr <= end) {
        const key = this.getDateKey(curr, 'day');
        salesByDate.set(key, { count: 0, amount: 0, expense: 0 });
        curr.setDate(curr.getDate() + 1);
      }
    }

    for (const order of orders) {
      const dateKey = this.getDateKey(order.createdAt, groupBy);
      const existing = salesByDate.get(dateKey) || {
        count: 0,
        amount: 0,
        expense: 0,
      };
      salesByDate.set(dateKey, {
        count: existing.count + 1,
        amount: existing.amount + Number(order.totalAmount),
        expense: existing.expense,
      });
    }

    for (const exp of expenses) {
      const dateKey = this.getDateKey(exp.transactionDate, groupBy);
      const existing = salesByDate.get(dateKey) || {
        count: 0,
        amount: 0,
        expense: 0,
      };
      salesByDate.set(dateKey, {
        count: existing.count,
        amount: existing.amount,
        expense: existing.expense + Number(exp.amount),
      });
    }

    return Array.from(salesByDate.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => ({
        date,
        count: data.count,
        amount: data.amount,
        expense: data.expense,
      }));
  }

  /**
   * En çok satan ürünler
   */
  async getTopProducts(query: DashboardQueryDto, limit = 10) {
    const dateFilter = this.getDateFilter(query);
    const topProducts = await this.prisma.orderItem.groupBy({
      by: ['variantId'],
      where: {
        order: {
          createdAt: dateFilter,
          status: { not: OrderStatus.CANCELLED },
        },
      },
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit ? Number(limit) : 10,
    });

    // Ürün detaylarını getir
    const products = await Promise.all(
      topProducts.map(async (item) => {
        const variant = await this.prisma.variant.findUnique({
          where: { id: item.variantId },
          include: {
            product: {
              select: { id: true, name: true, sku: true },
            },
          },
        });

        return {
          product: variant?.product,
          variant: variant
            ? { id: variant.id, size: variant.size, color: variant.color }
            : null,
          totalQuantity: item._sum.quantity || 0,
          totalRevenue: item._sum.total || 0,
        };
      }),
    );

    return products.filter((p) => p.product);
  }

  /**
   * Kritik stok uyarısı
   */
  async getLowStockProducts(threshold = 10, limit = 20) {
    const lowStock = await this.prisma.variant.findMany({
      where: {
        stock: { lte: threshold },
        product: { isActive: true },
      },
      include: {
        product: {
          select: { id: true, name: true, sku: true },
        },
      },
      orderBy: { stock: 'asc' },
      take: limit,
    });

    return lowStock.map((v) => ({
      product: v.product,
      variant: { id: v.id, size: v.size, color: v.color, sku: v.sku },
      stock: v.stock,
      critical: v.stock <= 5,
    }));
  }

  /**
   * Son siparişler
   */
  async getRecentOrders(query: DashboardQueryDto, limit = 10) {
    const dateFilter = this.getDateFilter(query);
    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: dateFilter,
      },
      take: limit ? Number(limit) : 10,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: { firstName: true, lastName: true },
        },
        user: {
          select: { firstName: true, lastName: true },
        },
        _count: {
          select: { items: true },
        },
      },
    });

    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: order.customer
        ? `${order.customer.firstName} ${order.customer.lastName}`
        : 'Misafir',
      staff: order.user
        ? `${order.user.firstName} ${order.user.lastName}`
        : 'Sistem',
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      itemCount: order._count.items,
      createdAt: order.createdAt,
    }));
  }

  /**
   * Sipariş durumu dağılımı
   */
  async getOrderStatusDistribution() {
    const distribution = await this.prisma.order.groupBy({
      by: ['status'],
      _count: true,
    });

    return distribution.map((d) => ({
      status: d.status,
      count: d._count,
    }));
  }

  /**
   * Ödeme yöntemi dağılımı
   */
  async getPaymentMethodDistribution(query: DashboardQueryDto) {
    const dateFilter = this.getDateFilter(query);

    const distribution = await this.prisma.payment.groupBy({
      by: ['method'],
      where: {
        createdAt: dateFilter,
        status: PaymentStatus.COMPLETED,
      },
      _sum: { amount: true },
      _count: true,
    });

    return distribution.map((d) => ({
      method: d.method,
      count: d._count,
      amount: d._sum.amount || 0,
    }));
  }

  /**
   * En iyi müşteriler
   */
  async getTopCustomers(limit = 10) {
    const customers = await this.prisma.customer.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { orders: true } },
        orders: {
          where: { status: { not: OrderStatus.CANCELLED } },
          select: { totalAmount: true },
        },
      },
      take: limit * 2, // Daha fazla al, sonra sırala
    });

    // Toplam harcamaya göre sırala
    const customersWithSpending = customers
      .map((c) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        phone: c.phone,
        email: c.email,
        totalOrders: c._count.orders,
        totalSpent: c.orders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, limit);

    return customersWithSpending;
  }

  /**
   * Tüm projede arama (Global Search)
   */
  async globalSearch(q: string) {
    const [products, orders, customers] = await Promise.all([
      // Ürünler
      this.prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { sku: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, name: true, sku: true, basePrice: true },
      }),
      // Siparişler
      this.prisma.order.findMany({
        where: {
          orderNumber: { contains: q, mode: 'insensitive' },
        },
        take: 5,
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          status: true,
          createdAt: true,
          customer: { select: { firstName: true, lastName: true } },
        },
      }),
      // Müşteriler
      this.prisma.customer.findMany({
        where: {
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
        },
      }),
    ]);

    return { products, orders, customers };
  }

  // Yardımcı fonksiyonlar
  private getDateFilter(query: DashboardQueryDto) {
    const filter: any = {};

    if (query.startDate) {
      filter.gte = new Date(query.startDate);
    } else {
      // Varsayılan: son 30 gün
      filter.gte = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    if (query.endDate) {
      filter.lte = new Date(query.endDate + 'T23:59:59.999Z');
    }

    return filter;
  }

  private getStartOfDay(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  private getDateKey(date: Date, groupBy: string): string {
    const d = new Date(date);

    switch (groupBy) {
      case 'week':
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        return weekStart.toISOString().split('T')[0];
      case 'month':
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      default: // day
        return d.toISOString().split('T')[0];
    }
  }
}
