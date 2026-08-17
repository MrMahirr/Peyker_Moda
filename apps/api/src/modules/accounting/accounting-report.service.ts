import { Injectable } from '@nestjs/common';
import { PaymentStatus, TransactionType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DEFAULT_TAX_RATE } from './accounting.constants';
import { AccountingPeriodSummary } from './accounting.types';

import { AccountingStorageService } from './accounting-storage.service';

@Injectable()
export class AccountingReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: AccountingStorageService,
  ) {}

  async getZReport(period: string = 'daily') {
    const today = new Date();
    let startDate: Date;
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    if (period === 'weekly') {
      startDate = new Date(today);
      const day = startDate.getDay() || 7;
      startDate.setDate(startDate.getDate() - (day - 1));
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'monthly') {
      startDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
        0,
        0,
        0,
        0,
      );
    } else {
      // daily
      startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);
    }

    const dateRange = { gte: startDate, lte: endDate };
    const taxRate = await this.getTaxRate();

    const [transactions, paymentsList] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { transactionDate: dateRange },
      }),
      this.prisma.payment.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: dateRange,
        },
      }),
    ]);

    let totalSales = 0;
    let totalReturns = 0;
    let cash = 0;
    let creditCard = 0;
    let other = 0;
    let cashIn = 0;
    let cashOut = 0;

    // 1. İşlemler (Manuel Gelir/Giderler)
    for (const t of transactions) {
      const amount = Number(t.amount);
      if (t.type === 'INCOME') {
        // Eğer siparişe bağlı değilse manuel gelirdir, satışa ekleyelim mi?
        // Genelde manuel gelirler de kasaya girer. Z-Raporunda gösterelim.
        totalSales += amount;
        cashIn += amount;

        if (t.paymentMethod === 'CASH') cash += amount;
        else if (t.paymentMethod === 'CREDIT_CARD') creditCard += amount;
        else other += amount;
      } else if (t.type === 'EXPENSE') {
        cashOut += amount;
        if (
          t.category === 'Return' ||
          t.description?.toLowerCase().includes('iade')
        ) {
          totalReturns += amount;
        }
      }
    }

    // 2. Ödemeler (Gerçek Sipariş / POS Satışları)
    for (const p of paymentsList) {
      const amount = Number(p.amount);
      totalSales += amount;
      cashIn += amount;

      if (p.method === 'CASH') cash += amount;
      else if (p.method === 'CREDIT_CARD') creditCard += amount;
      else other += amount;
    }

    const netSales = totalSales - totalReturns;
    const totalTax = this.extractVat(totalSales, taxRate);

    // Kasa başlangıç bakiyesi (Önceki günden devreden kasa)
    const snapshots = await this.storage.getZReportSnapshots();
    let startBalance = 0;

    if (period === 'daily') {
      const todayDateStr = startDate.toISOString().split('T')[0];
      // Bugün için kapanış alınmışsa, onu döndür!
      const existingSnapshot = snapshots.find((s) => s.date === todayDateStr);
      if (existingSnapshot) {
        return existingSnapshot;
      }

      // Bugün kapanış alınmamışsa, en son kapanmış günün devreden kasasını al
      if (snapshots.length > 0) {
        // Zaten sırayla ekleniyor, en sonuncu son eleman.
        const lastSnapshot = snapshots[snapshots.length - 1];
        startBalance = lastSnapshot.cashFlow.safeBalance;
      }
    }

    const safeBalance = startBalance + cashIn - cashOut;

    let titlePrefix = 'Z';
    if (period === 'weekly') titlePrefix = 'W';
    if (period === 'monthly') titlePrefix = 'M';

    return {
      date: `${startDate.toLocaleDateString('tr-TR')} - ${endDate.toLocaleDateString('tr-TR')}`,
      reportNo: `${titlePrefix}-${new Date().toISOString().split('T')[0].replace(/-/g, '')}`,
      summary: {
        totalSales,
        totalReturns,
        netSales,
        totalTax: this.roundCurrency(totalTax),
        transactionCount: transactions.length + paymentsList.length,
      },
      payments: {
        cash,
        creditCard,
        other,
      },
      cashFlow: {
        startBalance,
        cashIn,
        cashOut,
        safeBalance,
      },
    };
  }

  async closeZReport() {
    // 1. Oku (Günlük rapor)
    const currentReport = await this.getZReport('daily');
    const todayStr = new Date().toISOString().split('T')[0];

    // 2. Snapshotlara ekle
    const snapshots = await this.storage.getZReportSnapshots();

    // Zaten varsa bir daha kapatma
    if (snapshots.some((s) => s.date === todayStr)) {
      return currentReport;
    }

    const snapshot = {
      ...currentReport,
      date: todayStr, // Sadece YYYY-MM-DD olarak kaydet
      closedAt: new Date().toISOString(),
    };

    snapshots.push(snapshot);
    await this.storage.saveZReportSnapshots(snapshots);

    return snapshot;
  }

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
    // 1. Önce bu dönemin kapatılıp kapatılmadığını kontrol et
    const closedPeriods = await this.storage.getClosedPeriods();
    const existingClosedPeriod = closedPeriods.find(
      (period) => period.year === year && period.month === month,
    );

    if (existingClosedPeriod) {
      // Eğer kapatılmışsa, dondurulmuş (snapshot) veriyi ve isClosed bayrağını dön
      return {
        ...existingClosedPeriod.summary,
        isClosed: true,
      };
    }

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
      isClosed: false,
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
