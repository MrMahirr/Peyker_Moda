import {
    Injectable,
    NotFoundException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionDto, UpdateTransactionDto, TransactionQueryDto, ReportQueryDto } from './dto';
import { getPaginationParams, createPaginatedResult } from '../../common/utils';
import { TransactionType, OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class TransactionsService {
    private readonly logger = new Logger(TransactionsService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * İşlem listesi
     */
    async findAll(query: TransactionQueryDto) {
        const { page, limit, skip } = getPaginationParams(query);

        const where: any = {};

        if (query.type) {
            where.type = query.type;
        }

        if (query.category) {
            where.category = { contains: query.category, mode: 'insensitive' };
        }

        if (query.startDate || query.endDate) {
            where.transactionDate = {};
            if (query.startDate) {
                where.transactionDate.gte = new Date(query.startDate);
            }
            if (query.endDate) {
                where.transactionDate.lte = new Date(query.endDate + 'T23:59:59.999Z');
            }
        }

        const [transactions, total] = await Promise.all([
            this.prisma.transaction.findMany({
                where,
                skip,
                take: limit,
                orderBy: { transactionDate: 'desc' },
                include: {
                    order: {
                        select: { id: true, orderNumber: true },
                    },
                    user: {
                        select: { firstName: true, lastName: true },
                    },
                },
            }),
            this.prisma.transaction.count({ where }),
        ]);

        return createPaginatedResult(transactions, total, page, limit);
    }

    /**
     * Tekil işlem
     */
    async findOne(id: string) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id },
            include: {
                order: {
                    select: { id: true, orderNumber: true, totalAmount: true },
                },
                user: {
                    select: { firstName: true, lastName: true },
                },
            },
        });

        if (!transaction) {
            throw new NotFoundException('İşlem bulunamadı');
        }

        return transaction;
    }

    /**
     * Yeni işlem oluştur
     */
    async create(createTransactionDto: CreateTransactionDto, userId: string) {
        const transaction = await this.prisma.transaction.create({
            data: {
                ...createTransactionDto,
                transactionDate: createTransactionDto.transactionDate
                    ? new Date(createTransactionDto.transactionDate)
                    : new Date(),
                userId,
            },
        });

        return transaction;
    }

    /**
     * İşlem güncelle
     */
    async update(id: string, updateTransactionDto: any) { // Using any temporarily if DTO import issue, but should be UpdateTransactionDto
        const transaction = await this.prisma.transaction.findUnique({ where: { id } });
        if (!transaction) throw new NotFoundException('İşlem bulunamadı');

        if (updateTransactionDto.transactionDate) {
            updateTransactionDto.transactionDate = new Date(updateTransactionDto.transactionDate);
        }

        return this.prisma.transaction.update({
            where: { id },
            data: updateTransactionDto,
        });
    }

    /**
     * İşlem sil
     */
    async remove(id: string) {
        const transaction = await this.prisma.transaction.findUnique({ where: { id } });
        if (!transaction) throw new NotFoundException('İşlem bulunamadı');

        return this.prisma.transaction.delete({ where: { id } });
    }




    /**
     * Özet rapor
     */
    async getSummary(query: ReportQueryDto) {
        const dateFilter = {
            gte: new Date(query.startDate),
            lte: new Date(query.endDate + 'T23:59:59.999Z'),
        };

        // Gelir/Gider toplamları
        const [income, expense, salesFromOrders] = await Promise.all([
            this.prisma.transaction.aggregate({
                where: { type: TransactionType.INCOME, transactionDate: dateFilter },
                _sum: { amount: true },
                _count: true,
            }),
            this.prisma.transaction.aggregate({
                where: { type: TransactionType.EXPENSE, transactionDate: dateFilter },
                _sum: { amount: true },
                _count: true,
            }),
            this.prisma.order.aggregate({
                where: {
                    createdAt: dateFilter,
                    status: { not: OrderStatus.CANCELLED },
                    paymentStatus: PaymentStatus.COMPLETED,
                },
                _sum: { totalAmount: true },
                _count: true,
            }),
        ]);

        const totalIncome = Number(income._sum.amount || 0) + Number(salesFromOrders._sum.totalAmount || 0);
        const totalExpense = Number(expense._sum.amount || 0);

        return {
            period: {
                start: query.startDate,
                end: query.endDate,
            },
            income: {
                transactions: Number(income._sum.amount || 0),
                sales: Number(salesFromOrders._sum.totalAmount || 0),
                total: totalIncome,
                count: income._count + salesFromOrders._count,
            },
            expense: {
                total: totalExpense,
                count: expense._count,
            },
            netProfit: totalIncome - totalExpense,
        };
    }

    /**
     * Nakit ve Banka Bakiyeleri
     * Gerçek işlem kayıtlarından (Payment ve Transaction) nakit ve banka bakiyelerini dinamik hesaplar.
     */
    async getCashBankBalances() {
        // Nakit (CASH) giriş/çıkış hesaplamaları
        const [cashTransactionsIncome, cashTransactionsExpense, cashPayments] = await Promise.all([
            this.prisma.transaction.aggregate({
                where: { type: TransactionType.INCOME, paymentMethod: 'CASH' },
                _sum: { amount: true },
            }),
            this.prisma.transaction.aggregate({
                where: { type: TransactionType.EXPENSE, paymentMethod: 'CASH' },
                _sum: { amount: true },
            }),
            this.prisma.payment.aggregate({
                where: { status: PaymentStatus.COMPLETED, method: 'CASH' },
                _sum: { amount: true },
            }),
        ]);

        // Banka (Kredi Kartı, Havale vb.) giriş/çıkış hesaplamaları
        const bankMethods = ['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER'];
        
        const [bankTransactionsIncome, bankTransactionsExpense, bankPayments] = await Promise.all([
            this.prisma.transaction.aggregate({
                where: { type: TransactionType.INCOME, paymentMethod: { in: bankMethods as any } },
                _sum: { amount: true },
            }),
            this.prisma.transaction.aggregate({
                where: { type: TransactionType.EXPENSE, paymentMethod: { in: bankMethods as any } },
                _sum: { amount: true },
            }),
            this.prisma.payment.aggregate({
                where: { status: PaymentStatus.COMPLETED, method: { in: bankMethods as any } },
                _sum: { amount: true },
            }),
        ]);

        const totalCashIncome = Number(cashTransactionsIncome._sum.amount || 0) + Number(cashPayments._sum.amount || 0);
        const totalCashExpense = Number(cashTransactionsExpense._sum.amount || 0);
        const cashBalance = totalCashIncome - totalCashExpense;

        const totalBankIncome = Number(bankTransactionsIncome._sum.amount || 0) + Number(bankPayments._sum.amount || 0);
        const totalBankExpense = Number(bankTransactionsExpense._sum.amount || 0);
        const bankBalance = totalBankIncome - totalBankExpense;

        return {
            cashBalance,
            bankBalance,
            totalBalance: cashBalance + bankBalance
        };
    }

    /**
     * Satış raporu
     */
    async getSalesReport(query: ReportQueryDto) {
        const dateFilter = {
            gte: new Date(query.startDate),
            lte: new Date(query.endDate + 'T23:59:59.999Z'),
        };

        // Siparişler
        const orders = await this.prisma.order.findMany({
            where: {
                createdAt: dateFilter,
                status: { not: OrderStatus.CANCELLED },
            },
            select: {
                createdAt: true,
                totalAmount: true,
                status: true,
                paymentStatus: true,
            },
        });

        // Tarihe göre grupla
        const salesByDate = new Map<string, { count: number; amount: number }>();

        for (const order of orders) {
            const dateKey = this.getDateKey(order.createdAt, query.groupBy || 'day');
            const existing = salesByDate.get(dateKey) || { count: 0, amount: 0 };
            salesByDate.set(dateKey, {
                count: existing.count + 1,
                amount: existing.amount + Number(order.totalAmount),
            });
        }

        // Durum dağılımı
        const statusDistribution = await this.prisma.order.groupBy({
            by: ['status'],
            where: { createdAt: dateFilter },
            _count: true,
            _sum: { totalAmount: true },
        });

        return {
            period: { start: query.startDate, end: query.endDate },
            totalOrders: orders.length,
            totalAmount: orders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
            averageOrderValue: orders.length > 0
                ? orders.reduce((sum, o) => sum + Number(o.totalAmount), 0) / orders.length
                : 0,
            salesByDate: Array.from(salesByDate.entries()).map(([date, data]) => ({
                date,
                ...data,
            })),
            statusDistribution: statusDistribution.map((s) => ({
                status: s.status,
                count: s._count,
                amount: s._sum.totalAmount || 0,
            })),
        };
    }

    /**
     * Ürün raporu
     */
    async getProductsReport(query: ReportQueryDto) {
        const dateFilter = {
            gte: new Date(query.startDate),
            lte: new Date(query.endDate + 'T23:59:59.999Z'),
        };

        // En çok satanlar
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
            take: 20,
        });

        // Ürün detaylarını getir
        const products = await Promise.all(
            topProducts.map(async (item) => {
                const variant = await this.prisma.variant.findUnique({
                    where: { id: item.variantId },
                    include: {
                        product: { select: { id: true, name: true, sku: true } },
                    },
                });

                return {
                    product: variant?.product,
                    variant: variant ? { size: variant.size, color: variant.color } : null,
                    quantity: item._sum.quantity || 0,
                    revenue: item._sum.total || 0,
                };
            }),
        );

        // Kategori bazlı satış
        const categoryStats = await this.prisma.orderItem.findMany({
            where: {
                order: {
                    createdAt: dateFilter,
                    status: { not: OrderStatus.CANCELLED },
                },
            },
            include: {
                variant: {
                    include: {
                        product: {
                            include: { category: { select: { id: true, name: true } } },
                        },
                    },
                },
            },
        });

        const categoryMap = new Map<string, { name: string; count: number; amount: number }>();
        for (const item of categoryStats) {
            const cat = item.variant?.product?.category;
            if (cat) {
                const existing = categoryMap.get(cat.id) || { name: cat.name, count: 0, amount: 0 };
                categoryMap.set(cat.id, {
                    name: cat.name,
                    count: existing.count + item.quantity,
                    amount: existing.amount + Number(item.total),
                });
            }
        }

        return {
            period: { start: query.startDate, end: query.endDate },
            topProducts: products.filter((p) => p.product),
            categoryStats: Array.from(categoryMap.values()),
        };
    }

    /**
     * Z Raporu (günlük kasa kapanış)
     */
    async getZReport(date: string) {
        const startOfDay = new Date(date);
        const endOfDay = new Date(date + 'T23:59:59.999Z');

        const [orders, payments, transactions] = await Promise.all([
            // Siparişler
            this.prisma.order.findMany({
                where: {
                    createdAt: { gte: startOfDay, lte: endOfDay },
                },
                select: {
                    id: true,
                    orderNumber: true,
                    totalAmount: true,
                    status: true,
                    paymentStatus: true,
                },
            }),
            // Ödemeler (yöntem bazında)
            this.prisma.payment.groupBy({
                by: ['method'],
                where: {
                    createdAt: { gte: startOfDay, lte: endOfDay },
                    status: PaymentStatus.COMPLETED,
                },
                _sum: { amount: true },
                _count: true,
            }),
            // Manuel işlemler
            this.prisma.transaction.findMany({
                where: {
                    transactionDate: { gte: startOfDay, lte: endOfDay },
                },
                select: {
                    type: true,
                    amount: true,
                    description: true,
                },
            }),
        ]);

        const completedOrders = orders.filter((o) => o.status !== OrderStatus.CANCELLED);
        const cancelledOrders = orders.filter((o) => o.status === OrderStatus.CANCELLED);

        const totalSales = completedOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
        const manualIncome = transactions
            .filter((t) => t.type === TransactionType.INCOME)
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const manualExpense = transactions
            .filter((t) => t.type === TransactionType.EXPENSE)
            .reduce((sum, t) => sum + Number(t.amount), 0);

        return {
            date,
            orders: {
                total: orders.length,
                completed: completedOrders.length,
                cancelled: cancelledOrders.length,
            },
            sales: {
                gross: totalSales,
                net: totalSales - manualExpense + manualIncome,
            },
            paymentMethods: payments.map((p) => ({
                method: p.method,
                count: p._count,
                amount: p._sum.amount || 0,
            })),
            manualTransactions: {
                income: manualIncome,
                expense: manualExpense,
            },
            grandTotal: totalSales + manualIncome - manualExpense,
        };
    }

    /**
     * Finansal Rapor (Gelir/Gider/Kar)
     */
    async getFinancialReport(query: ReportQueryDto) {
        const { startDate, endDate } = query;
        const where: any = {};

        if (startDate && endDate) {
            where.transactionDate = {
                gte: new Date(startDate),
                lte: new Date(endDate + 'T23:59:59.999Z'),
            };
        }

        // Calculate totals using aggregation
        const aggregations = await this.prisma.transaction.groupBy({
            by: ['type'],
            where,
            _sum: {
                amount: true,
            },
        });

        let totalIncome = 0;
        let totalExpense = 0;

        aggregations.forEach(agg => {
            if (agg.type === TransactionType.INCOME) {
                totalIncome = Number(agg._sum.amount || 0);
            } else if (agg.type === TransactionType.EXPENSE) {
                totalExpense = Number(agg._sum.amount || 0);
            }
        });

        return {
            period: { startDate: startDate || 'All Time', endDate: endDate || 'All Time' },
            totalIncome,
            totalExpense,
            netProfit: totalIncome - totalExpense,
            currency: 'TRY'
        };
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
            default:
                return d.toISOString().split('T')[0];
        }
    }
}
