import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  TransactionType,
} from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AccountingDuePaymentService } from './accounting-due-payment.service';
import { AccountingReportService } from './accounting-report.service';
import { AccountingStorageService } from './accounting-storage.service';
import {
  CheckQueryDto,
  ClosePeriodDto,
  CreateBankAccountDto,
  CreateCheckDto,
  CreateRegisterDto,
  DuePaymentQueryDto,
  PeriodSummaryQueryDto,
  RecordInstallmentPaymentDto,
  UpdateBankAccountDto,
  UpdateCheckStatusDto,
  UpdateRegisterDto,
  VatReportQueryDto,
} from './dto';
import {
  AccountingBankAccount,
  AccountingCheck,
  AccountingCheckStatus,
  AccountingClosedPeriod,
  AccountingInstallment,
  AccountingInstallmentStatus,
  AccountingRegister,
} from './accounting.types';

type InstallmentOrder = Prisma.OrderGetPayload<{
  include: {
    customer: {
      select: {
        firstName: true;
        lastName: true;
      };
    };
    payments: {
      select: {
        id: true;
        createdAt: true;
        amount: true;
        status: true;
      };
    };
  };
}>;

@Injectable()
export class AccountingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: AccountingStorageService,
    private readonly reportService: AccountingReportService,
    private readonly duePaymentService: AccountingDuePaymentService,
  ) {}

  async getRegisters() {
    const registers = await this.storage.getRegisters();
    return registers.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async createRegister(dto: CreateRegisterDto) {
    const registers = await this.storage.getRegisters();
    const register: AccountingRegister = {
      id: randomUUID(),
      name: dto.name,
      type: dto.type,
      balance: dto.balance ?? 0,
      isActive: dto.isActive ?? true,
      createdAt: new Date().toISOString(),
    };

    registers.push(register);
    await this.storage.saveRegisters(registers);

    return register;
  }

  async updateRegister(id: string, dto: UpdateRegisterDto) {
    const registers = await this.storage.getRegisters();
    const index = registers.findIndex((register) => register.id === id);

    if (index === -1) {
      throw new NotFoundException('Kasa bulunamadi');
    }

    const updatedRegister: AccountingRegister = {
      ...registers[index],
      ...dto,
    };

    registers[index] = updatedRegister;
    await this.storage.saveRegisters(registers);

    return updatedRegister;
  }

  async getBankAccounts() {
    const accounts = await this.storage.getBankAccounts();
    return accounts.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async createBankAccount(dto: CreateBankAccountDto) {
    const accounts = await this.storage.getBankAccounts();
    const normalizedIban = dto.iban.replace(/\s+/g, '').toUpperCase();

    if (accounts.some((account) => account.iban === normalizedIban)) {
      throw new ConflictException('Bu IBAN ile kayitli bir hesap zaten var');
    }

    const account: AccountingBankAccount = {
      id: randomUUID(),
      bankName: dto.bankName,
      accountName: dto.accountName,
      iban: normalizedIban,
      currency: dto.currency ?? 'TRY',
      balance: dto.balance ?? 0,
      isActive: dto.isActive ?? true,
      createdAt: new Date().toISOString(),
    };

    accounts.push(account);
    await this.storage.saveBankAccounts(accounts);

    return account;
  }

  async updateBankAccount(id: string, dto: UpdateBankAccountDto) {
    const accounts = await this.storage.getBankAccounts();
    const index = accounts.findIndex((account) => account.id === id);

    if (index === -1) {
      throw new NotFoundException('Banka hesabi bulunamadi');
    }

    const normalizedIban = dto.iban
      ? dto.iban.replace(/\s+/g, '').toUpperCase()
      : undefined;

    if (
      normalizedIban &&
      accounts.some(
        (account) => account.id !== id && account.iban === normalizedIban,
      )
    ) {
      throw new ConflictException('Bu IBAN ile kayitli bir hesap zaten var');
    }

    const updatedAccount: AccountingBankAccount = {
      ...accounts[index],
      ...dto,
      iban: normalizedIban ?? accounts[index].iban,
    };

    accounts[index] = updatedAccount;
    await this.storage.saveBankAccounts(accounts);

    return updatedAccount;
  }

  async deleteBankAccount(id: string) {
    const accounts = await this.storage.getBankAccounts();
    const filteredAccounts = accounts.filter((account) => account.id !== id);

    if (filteredAccounts.length === accounts.length) {
      throw new NotFoundException('Banka hesabi bulunamadi');
    }

    await this.storage.saveBankAccounts(filteredAccounts);

    return {
      message: 'Banka hesabi silindi',
    };
  }

  async getChecks(query: CheckQueryDto) {
    const checks = await this.storage.getChecks();

    return checks
      .filter((check) => (query.type ? check.type === query.type : true))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }

  async createCheck(dto: CreateCheckDto) {
    const checks = await this.storage.getChecks();

    if (checks.some((check) => check.checkNumber === dto.checkNumber)) {
      throw new ConflictException('Bu cek numarasi zaten kullaniliyor');
    }

    const check: AccountingCheck = {
      id: randomUUID(),
      type: dto.type,
      checkNumber: dto.checkNumber,
      bankName: dto.bankName,
      amount: dto.amount,
      dueDate: new Date(dto.dueDate).toISOString(),
      status: dto.status ?? AccountingCheckStatus.PENDING,
      customerName: dto.customerName,
      supplierName: dto.supplierName,
      notes: dto.notes,
      createdAt: new Date().toISOString(),
    };

    checks.push(check);
    await this.storage.saveChecks(checks);

    return check;
  }

  async updateCheckStatus(id: string, dto: UpdateCheckStatusDto) {
    const checks = await this.storage.getChecks();
    const index = checks.findIndex((check) => check.id === id);

    if (index === -1) {
      throw new NotFoundException('Cek bulunamadi');
    }

    const updatedCheck: AccountingCheck = {
      ...checks[index],
      status: dto.status,
    };

    checks[index] = updatedCheck;
    await this.storage.saveChecks(checks);

    return updatedCheck;
  }

  async getInstallments() {
    const orders = await this.getInstallmentOrders();

    return orders
      .map((order) => this.mapOrderToInstallment(order))
      .filter(
        (installment) =>
          installment.remainingAmount > 0 || installment.paidInstallments > 1,
      );
  }

  async recordInstallmentPayment(
    id: string,
    dto: RecordInstallmentPaymentDto,
    userId: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        payments: {
          orderBy: {
            createdAt: 'asc',
          },
          select: {
            id: true,
            createdAt: true,
            amount: true,
            status: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Taksit kaydi bulunamadi');
    }

    const totalAmount = Number(order.totalAmount);
    const paidAmount = Number(order.paidAmount);
    const remainingAmount = totalAmount - paidAmount;

    if (remainingAmount <= 0) {
      throw new BadRequestException('Bu siparisin acik taksiti bulunmuyor');
    }

    if (dto.amount > remainingAmount) {
      throw new BadRequestException('Odeme tutari kalan bakiyeden buyuk olamaz');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          orderId: order.id,
          amount: dto.amount,
          method: PaymentMethod.OTHER,
          status: PaymentStatus.COMPLETED,
          notes: 'Installment payment',
        },
      });

      const updatedPaidAmount = paidAmount + dto.amount;

      await tx.order.update({
        where: { id: order.id },
        data: {
          paidAmount: updatedPaidAmount,
          paymentStatus:
            updatedPaidAmount >= totalAmount
              ? PaymentStatus.COMPLETED
              : PaymentStatus.PARTIAL,
        },
      });

      await tx.transaction.create({
        data: {
          type: TransactionType.INCOME,
          category: 'Installment',
          amount: dto.amount,
          description: `Installment payment for order ${order.orderNumber}`,
          reference: order.orderNumber,
          paymentMethod: PaymentMethod.OTHER,
          orderId: order.id,
          transactionDate: new Date(),
          userId,
        },
      });
    });

    const refreshedOrder = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        payments: {
          orderBy: {
            createdAt: 'asc',
          },
          select: {
            id: true,
            createdAt: true,
            amount: true,
            status: true,
          },
        },
      },
    });

    if (!refreshedOrder) {
      throw new NotFoundException('Taksit kaydi bulunamadi');
    }

    return this.mapOrderToInstallment(refreshedOrder);
  }

  async getDuePayments(query: DuePaymentQueryDto) {
    const [checks, installments] = await Promise.all([
      this.storage.getChecks(),
      this.getInstallments(),
    ]);

    const duePayments = [
      ...this.duePaymentService.fromChecks(checks),
      ...this.duePaymentService.fromInstallments(installments),
    ]
      .filter((item) => (query.type ? item.type === query.type : true))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    return duePayments;
  }

  async getVatReport(query: VatReportQueryDto) {
    return this.reportService.getVatReport(query.year);
  }

  async getPeriodSummary(query: PeriodSummaryQueryDto) {
    return this.reportService.getPeriodSummary(query.year, query.month);
  }

  async closePeriod(dto: ClosePeriodDto, userId: string) {
    const closedPeriods = await this.storage.getClosedPeriods();
    const existingPeriod = closedPeriods.find(
      (period) => period.year === dto.year && period.month === dto.month,
    );

    if (existingPeriod) {
      throw new ConflictException('Bu donem zaten kapatildi');
    }

    const summary = await this.reportService.getPeriodSummary(dto.year, dto.month);
    const closedPeriod: AccountingClosedPeriod = {
      id: randomUUID(),
      year: dto.year,
      month: dto.month,
      summary,
      closedAt: new Date().toISOString(),
      closedByUserId: userId,
    };

    closedPeriods.push(closedPeriod);
    await this.storage.saveClosedPeriods(closedPeriods);

    return closedPeriod;
  }

  private async getInstallmentOrders() {
    return this.prisma.order.findMany({
      where: {
        status: {
          not: OrderStatus.CANCELLED,
        },
        paymentStatus: {
          in: [PaymentStatus.PENDING, PaymentStatus.PARTIAL, PaymentStatus.COMPLETED],
        },
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        payments: {
          orderBy: {
            createdAt: 'asc',
          },
          select: {
            id: true,
            createdAt: true,
            amount: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  private mapOrderToInstallment(order: InstallmentOrder): AccountingInstallment {
    const totalAmount = Number(order.totalAmount);
    const paidAmount = Number(order.paidAmount);
    const remainingAmount = Math.max(0, totalAmount - paidAmount);
    const paidInstallments = order.payments.filter(
      (payment) => payment.status === PaymentStatus.COMPLETED,
    ).length;
    const installmentCount = Math.max(
      paidInstallments + (remainingAmount > 0 ? 1 : 0),
      remainingAmount > 0 ? 2 : paidInstallments || 1,
    );
    const nextDueDate =
      remainingAmount > 0
        ? this.addDays(order.createdAt, 30 * Math.max(1, paidInstallments))
        : undefined;

    return {
      id: order.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: this.getCustomerName(order),
      totalAmount,
      paidAmount,
      remainingAmount,
      installmentCount,
      paidInstallments,
      nextDueDate: nextDueDate?.toISOString(),
      status: this.getInstallmentStatus(order, remainingAmount, nextDueDate),
    };
  }

  private getInstallmentStatus(
    order: InstallmentOrder,
    remainingAmount: number,
    nextDueDate?: Date,
  ) {
    if (order.status === 'CANCELLED') {
      return AccountingInstallmentStatus.CANCELLED;
    }

    if (remainingAmount <= 0) {
      return AccountingInstallmentStatus.COMPLETED;
    }

    if (nextDueDate && nextDueDate.getTime() < Date.now()) {
      return AccountingInstallmentStatus.OVERDUE;
    }

    return AccountingInstallmentStatus.ACTIVE;
  }

  private getCustomerName(order: InstallmentOrder) {
    const firstName = order.customer?.firstName ?? '';
    const lastName = order.customer?.lastName ?? '';
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || 'Musteri belirtilmedi';
  }

  private addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
  }
}
