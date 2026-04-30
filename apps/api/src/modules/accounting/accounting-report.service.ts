import { Injectable } from '@nestjs/common';
import { PaymentStatus, TransactionType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DEFAULT_TAX_RATE } from './accounting.constants';
import { AccountingPeriodSummary } from './accounting.types';

@Injectable()
export class AccountingReportService {
  constructor(private readonly prisma: PrismaService) {}

  async getVatReport(year: number) {
    const dateRange = this.getYearDateRange(year);
    const taxRate = await this.getTaxRate();

    const [payments, expenses] = await Promise.all([
      this.prisma.payment.findMany({
        where: {
          status: PaymentStatus.COMPLETED,
          createdAt: dateRange,
        },
        select: {
          amount: true,
          createdAt: true,
        },
      }),
      this.prisma.transaction.findMany({
        where: {
          type: TransactionType.EXPENSE,
          transactionDate: dateRange,
        },
        select: {
          amount: true,
          transactionDate: true,
        },
      }),
    ]);

    const lines = Array.from({ length: 12 }, (_, index) => ({
      period: `${year}-${String(index + 1).padStart(2, '0')}`,
      salesVat: 0,
      purchaseVat: 0,
      netVat: 0,
    }));

    for (const payment of payments) {
      const monthIndex = payment.createdAt.getUTCMonth();
      lines[monthIndex].salesVat += this.extractVat(
        Number(payment.amount),
        taxRate,
      );
    }

    for (const expense of expenses) {
      const monthIndex = expense.transactionDate.getUTCMonth();
      lines[monthIndex].purchaseVat += this.extractVat(
        Number(expense.amount),
        taxRate,
      );
    }

    return {
      lines: lines.map((line) => ({
        ...line,
        salesVat: this.roundCurrency(line.salesVat),
        purchaseVat: this.roundCurrency(line.purchaseVat),
        netVat: this.roundCurrency(line.salesVat - line.purchaseVat),
      })),
    };
  }

  async getPeriodSummary(
    year: number,
    month: number,
  ): Promise<AccountingPeriodSummary> {
    const dateRange = this.getMonthDateRange(year, month);
    const taxRate = await this.getTaxRate();

    const [incomeAggregate, expenseAggregate, paymentAggregate] =
      await Promise.all([
        this.prisma.transaction.aggregate({
          where: {
            type: TransactionType.INCOME,
            orderId: null,
            transactionDate: dateRange,
          },
          _sum: {
            amount: true,
          },
        }),
        this.prisma.transaction.aggregate({
          where: {
            type: TransactionType.EXPENSE,
            transactionDate: dateRange,
          },
          _sum: {
            amount: true,
          },
        }),
        this.prisma.payment.aggregate({
          where: {
            status: PaymentStatus.COMPLETED,
            createdAt: dateRange,
          },
          _sum: {
            amount: true,
          },
        }),
      ]);

    const transactionIncome = Number(incomeAggregate._sum.amount ?? 0);
    const transactionExpense = Number(expenseAggregate._sum.amount ?? 0);
    const paymentIncome = Number(paymentAggregate._sum.amount ?? 0);
    const totalIncome = transactionIncome + paymentIncome;
    const totalExpense = transactionExpense;
    const estimatedSalesVat = this.extractVat(paymentIncome, taxRate);
    const estimatedPurchaseVat = this.extractVat(totalExpense, taxRate);

    return {
      period: `${year}-${String(month).padStart(2, '0')}`,
      totalIncome: this.roundCurrency(totalIncome),
      totalExpense: this.roundCurrency(totalExpense),
      netProfit: this.roundCurrency(totalIncome - totalExpense),
      taxPayable: this.roundCurrency(
        Math.max(0, estimatedSalesVat - estimatedPurchaseVat),
      ),
    };
  }

  private async getTaxRate() {
    const row = await this.prisma.setting.findUnique({
      where: { key: 'taxRate' },
      select: { value: true },
    });

    const parsed = row ? Number(row.value) : NaN;
    return Number.isFinite(parsed) ? parsed : DEFAULT_TAX_RATE;
  }

  private extractVat(grossAmount: number, taxRate: number) {
    if (taxRate <= 0) {
      return 0;
    }

    return grossAmount * (taxRate / (100 + taxRate));
  }

  private roundCurrency(value: number) {
    return Number(value.toFixed(2));
  }

  private getYearDateRange(year: number) {
    return {
      gte: new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0)),
      lte: new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)),
    };
  }

  private getMonthDateRange(year: number, month: number) {
    return {
      gte: new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0)),
      lte: new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)),
    };
  }
}
