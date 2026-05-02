import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportPeriod } from './dto/reports.dto';

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) {}

    private getDateRange(period?: ReportPeriod): { startDate: Date; endDate: Date } {
        const endDate = new Date();
        const startDate = new Date();

        switch (period) {
            case ReportPeriod.THIS_MONTH:
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                break;
            case ReportPeriod.LAST_MONTH:
                startDate.setMonth(startDate.getMonth() - 1);
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                endDate.setDate(0); // Last day of previous month
                endDate.setHours(23, 59, 59, 999);
                break;
            case ReportPeriod.LAST_3_MONTHS:
                startDate.setMonth(startDate.getMonth() - 3);
                startDate.setHours(0, 0, 0, 0);
                break;
            case ReportPeriod.THIS_YEAR:
                startDate.setMonth(0, 1);
                startDate.setHours(0, 0, 0, 0);
                break;
            default:
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
        }

        return { startDate, endDate };
    }

    async getSalesStats(period?: ReportPeriod) {
        const { startDate, endDate } = this.getDateRange(period);

        const orders = await this.prisma.order.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
                status: {
                    not: 'CANCELLED',
                },
            },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: true,
                            },
                        },
                    },
                },
                returns: true,
            },
        });

        let totalRevenue = 0;
        let totalCost = 0;
        let returnCount = 0;

        for (const order of orders) {
            // Sadece ödemesi tamamlanmış olanları ciroya katabiliriz, ama basitlik adına 
            // CANCELLED olmayan her şey ciro olarak sayılabilir. (TotalAmount kullanarak)
            if (order.paymentStatus === 'COMPLETED' || order.paymentStatus === 'PARTIAL') {
                totalRevenue += Number(order.totalAmount);

                for (const item of order.items) {
                    const cost = Number(item.variant?.product?.cost || 0);
                    totalCost += cost * item.quantity;
                }
            }

            if (order.returns && order.returns.length > 0) {
                returnCount++;
            }
        }

        const netProfit = totalRevenue - totalCost;
        const salesCount = orders.length;
        const returnRate = salesCount > 0 ? (returnCount / salesCount) * 100 : 0;

        return {
            totalRevenue,
            netProfit,
            salesCount,
            returnRate,
            period: { startDate, endDate },
        };
    }

    async getProductPerformance(period?: ReportPeriod) {
        const { startDate, endDate } = this.getDateRange(period);

        const orderItems = await this.prisma.orderItem.findMany({
            where: {
                order: {
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                    status: {
                        not: 'CANCELLED',
                    },
                    paymentStatus: {
                        in: ['COMPLETED', 'PARTIAL']
                    }
                },
            },
            include: {
                variant: {
                    include: {
                        product: {
                            include: {
                                category: true,
                            },
                        },
                    },
                },
            },
        });

        const productSales: Record<string, { id: string, name: string, quantity: number, revenue: number }> = {};
        const categorySales: Record<string, { id: string, name: string, quantity: number, revenue: number }> = {};

        for (const item of orderItems) {
            const product = item.variant?.product;
            if (!product) continue;

            // Aggregate Product
            if (!productSales[product.id]) {
                productSales[product.id] = {
                    id: product.id,
                    name: product.name,
                    quantity: 0,
                    revenue: 0,
                };
            }
            productSales[product.id].quantity += item.quantity;
            productSales[product.id].revenue += Number(item.total);

            // Aggregate Category
            const category = product.category;
            if (category) {
                if (!categorySales[category.id]) {
                    categorySales[category.id] = {
                        id: category.id,
                        name: category.name,
                        quantity: 0,
                        revenue: 0,
                    };
                }
                categorySales[category.id].quantity += item.quantity;
                categorySales[category.id].revenue += Number(item.total);
            }
        }

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        const topCategories = Object.values(categorySales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        return {
            topProducts,
            topCategories,
        };
    }
}
