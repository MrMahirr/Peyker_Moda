import { Injectable } from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { OPEN_CHECK_STATUSES } from './accounting.constants';
import { AccountingStorageService } from './accounting-storage.service';
import { CurrentAccountQueryDto } from './dto';
import {
  AccountingCheck,
  AccountingCurrentAccount,
  AccountingCurrentAccountType,
} from './accounting.types';

type MutableCurrentAccount = Omit<
  AccountingCurrentAccount,
  'type' | 'name' | 'id' | 'balance'
> & {
  id: string;
  type: AccountingCurrentAccountType;
  name: string;
};

@Injectable()
export class AccountingCurrentAccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: AccountingStorageService,
  ) {}

  async getCurrentAccounts(query: CurrentAccountQueryDto) {
    if (query.type === AccountingCurrentAccountType.SUPPLIER) {
      return this.getSupplierCurrentAccounts();
    }

    if (query.type === AccountingCurrentAccountType.CUSTOMER) {
      return this.getCustomerCurrentAccounts();
    }

    const [customers, suppliers] = await Promise.all([
      this.getCustomerCurrentAccounts(),
      this.getSupplierCurrentAccounts(),
    ]);

    return [...customers, ...suppliers].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }

  private async getCustomerCurrentAccounts() {
    const [customers, checks] = await Promise.all([
      this.prisma.customer.findMany({
        include: {
          orders: {
            where: {
              status: {
                not: OrderStatus.CANCELLED,
              },
              paymentStatus: {
                in: [
                  PaymentStatus.PENDING,
                  PaymentStatus.PARTIAL,
                  PaymentStatus.COMPLETED,
                ],
              },
            },
            select: {
              id: true,
              totalAmount: true,
              paidAmount: true,
              updatedAt: true,
            },
          },
        },
        orderBy: {
          firstName: 'asc',
        },
      }),
      this.storage.getChecks(),
    ]);

    const openReceivedChecks = checks.filter(
      (check) =>
        check.type === 'RECEIVED' &&
        OPEN_CHECK_STATUSES.includes(check.status) &&
        check.customerName,
    );

    const checkMap = this.groupChecksByName(openReceivedChecks, 'customerName');

    return customers
      .map((customer) => {
        const name = `${customer.firstName} ${customer.lastName}`.trim();
        const groupedChecks = checkMap.get(name) ?? [];
        const totalDebt = customer.orders.reduce((sum, order) => {
          const remaining =
            Number(order.totalAmount) - Number(order.paidAmount);
          return sum + Math.max(0, remaining);
        }, 0);
        const totalCredit = groupedChecks.reduce(
          (sum, check) => sum + check.amount,
          0,
        );

        return this.createCurrentAccount({
          id: customer.id,
          type: AccountingCurrentAccountType.CUSTOMER,
          name,
          phone: customer.phone ?? undefined,
          email: customer.email ?? undefined,
          totalDebt,
          totalCredit,
          lastTransactionAt: this.getLatestDate([
            ...customer.orders.map((order) => order.updatedAt.toISOString()),
            ...groupedChecks.map((check) => check.createdAt),
          ]),
        });
      })
      .filter(
        (account) =>
          account.totalDebt > 0 ||
          account.totalCredit > 0 ||
          account.lastTransactionAt,
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private async getSupplierCurrentAccounts() {
    const checks = await this.storage.getChecks();
    const openSupplierChecks = checks.filter(
      (check) =>
        OPEN_CHECK_STATUSES.includes(check.status) &&
        Boolean(check.supplierName),
    );

    const grouped = this.groupChecksByName(openSupplierChecks, 'supplierName');

    return Array.from(grouped.entries())
      .map(([supplierName, supplierChecks]) => {
        const totalDebt = supplierChecks
          .filter((check) => check.type === 'GIVEN')
          .reduce((sum, check) => sum + check.amount, 0);
        const totalCredit = supplierChecks
          .filter((check) => check.type === 'RECEIVED')
          .reduce((sum, check) => sum + check.amount, 0);

        return this.createCurrentAccount({
          id: this.createSupplierId(supplierName),
          type: AccountingCurrentAccountType.SUPPLIER,
          name: supplierName,
          totalDebt,
          totalCredit,
          lastTransactionAt: this.getLatestDate(
            supplierChecks.map((check) => check.createdAt),
          ),
        });
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private groupChecksByName(
    checks: AccountingCheck[],
    key: 'customerName' | 'supplierName',
  ) {
    const grouped = new Map<string, AccountingCheck[]>();

    for (const check of checks) {
      const name = check[key]?.trim();

      if (!name) {
        continue;
      }

      const existing = grouped.get(name) ?? [];
      existing.push(check);
      grouped.set(name, existing);
    }

    return grouped;
  }

  private createCurrentAccount(
    account: MutableCurrentAccount,
  ): AccountingCurrentAccount {
    const totalDebt = this.roundCurrency(account.totalDebt);
    const totalCredit = this.roundCurrency(account.totalCredit);

    return {
      ...account,
      totalDebt,
      totalCredit,
      balance: this.roundCurrency(totalCredit - totalDebt),
    };
  }

  private roundCurrency(value: number) {
    return Number(value.toFixed(2));
  }

  private getLatestDate(dates: Array<string | undefined>) {
    const normalizedDates = dates.filter((date): date is string =>
      Boolean(date),
    );

    if (normalizedDates.length === 0) {
      return undefined;
    }

    return normalizedDates.reduce((latest, current) =>
      new Date(current).getTime() > new Date(latest).getTime()
        ? current
        : latest,
    );
  }

  private createSupplierId(name: string) {
    return `supplier-${name
      .toLocaleLowerCase('tr-TR')
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')}`;
  }
}
