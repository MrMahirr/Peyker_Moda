import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CustomerAnalyticsResponse,
  CustomerChurnRisk,
} from './customer-analytics.types';
import { CustomersService } from './customers.service';

type CustomerAnalyticsOrder = Prisma.OrderGetPayload<{
  select: {
    id: true;
    totalAmount: true;
    createdAt: true;
    status: true;
    items: {
      select: {
        quantity: true;
        total: true;
        variant: {
          select: {
            product: {
              select: {
                category: {
                  select: {
                    name: true;
                  };
                };
              };
            };
          };
        };
      };
    };
  };
}>;

@Injectable()
export class CustomerAnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customersService: CustomersService,
  ) {}

  async getAnalytics(customerId: string): Promise<CustomerAnalyticsResponse> {
    await this.customersService.findOne(customerId);

    const orders = await this.prisma.order.findMany({
      where: {
        customerId,
        status: {
          not: OrderStatus.CANCELLED,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
        totalAmount: true,
        createdAt: true,
        status: true,
        items: {
          select: {
            quantity: true,
            total: true,
            variant: {
              select: {
                product: {
                  select: {
                    category: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const lifetimeValue = this.roundCurrency(
      orders.reduce((sum, order) => sum + Number(order.totalAmount), 0),
    );
    const averageOrderValue =
      orders.length > 0
        ? this.roundCurrency(lifetimeValue / orders.length)
        : 0;
    const purchaseFrequency = this.calculatePurchaseFrequency(orders);
    const lastPurchaseDate = orders.at(-1)?.createdAt.toISOString();
    const favoriteCategory = this.getFavoriteCategory(orders);
    const churnRisk = this.getChurnRisk(lastPurchaseDate, purchaseFrequency);

    return {
      customerId,
      lifetimeValue,
      averageOrderValue,
      purchaseFrequency,
      lastPurchaseDate,
      favoriteCategory,
      churnRisk,
    };
  }

  private calculatePurchaseFrequency(orders: CustomerAnalyticsOrder[]) {
    if (orders.length < 2) {
      return 0;
    }

    const intervalsInDays: number[] = [];

    for (let index = 1; index < orders.length; index += 1) {
      const previous = orders[index - 1].createdAt.getTime();
      const current = orders[index].createdAt.getTime();
      intervalsInDays.push((current - previous) / (1000 * 60 * 60 * 24));
    }

    const averageInterval =
      intervalsInDays.reduce((sum, days) => sum + days, 0) /
      intervalsInDays.length;

    return Math.round(averageInterval);
  }

  private getFavoriteCategory(orders: CustomerAnalyticsOrder[]) {
    const categoryTotals = new Map<string, { quantity: number; revenue: number }>();

    for (const order of orders) {
      for (const item of order.items) {
        const categoryName = item.variant.product.category.name;

        if (!categoryName) {
          continue;
        }

        const existing = categoryTotals.get(categoryName) ?? {
          quantity: 0,
          revenue: 0,
        };

        categoryTotals.set(categoryName, {
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + Number(item.total),
        });
      }
    }

    const sortedCategories = Array.from(categoryTotals.entries()).sort(
      (left, right) => {
        if (right[1].quantity !== left[1].quantity) {
          return right[1].quantity - left[1].quantity;
        }

        return right[1].revenue - left[1].revenue;
      },
    );

    return sortedCategories[0]?.[0];
  }

  private getChurnRisk(
    lastPurchaseDate: string | undefined,
    purchaseFrequency: number,
  ) {
    if (!lastPurchaseDate) {
      return CustomerChurnRisk.HIGH;
    }

    const daysSinceLastPurchase = Math.floor(
      (Date.now() - new Date(lastPurchaseDate).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const mediumThreshold = purchaseFrequency > 0 ? purchaseFrequency * 2 : 60;
    const highThreshold = purchaseFrequency > 0 ? purchaseFrequency * 4 : 120;

    if (daysSinceLastPurchase >= highThreshold) {
      return CustomerChurnRisk.HIGH;
    }

    if (daysSinceLastPurchase >= mediumThreshold) {
      return CustomerChurnRisk.MEDIUM;
    }

    return CustomerChurnRisk.LOW;
  }

  private roundCurrency(value: number) {
    return Number(value.toFixed(2));
  }
}
