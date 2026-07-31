import { Injectable } from '@nestjs/common';
import { OPEN_CHECK_STATUSES } from './accounting.constants';
import {
  AccountingCheck,
  AccountingDuePayment,
  AccountingDuePaymentStatus,
  AccountingDuePaymentType,
  AccountingInstallment,
  AccountingInstallmentStatus,
} from './accounting.types';

@Injectable()
export class AccountingDuePaymentService {
  fromChecks(checks: AccountingCheck[]): AccountingDuePayment[] {
    return checks
      .filter((check) => OPEN_CHECK_STATUSES.includes(check.status))
      .map((check) => {
        const dueMetrics = this.getDueMetrics(check.dueDate);

        return {
          id: `check-${check.id}`,
          type:
            check.type === 'RECEIVED'
              ? AccountingDuePaymentType.RECEIVABLE
              : AccountingDuePaymentType.PAYABLE,
          entityName: check.customerName ?? check.supplierName ?? check.bankName,
          amount: check.amount,
          dueDate: check.dueDate,
          daysOverdue: dueMetrics.daysOverdue,
          invoiceNumber: check.checkNumber,
          status: dueMetrics.status,
        };
      });
  }

  fromInstallments(
    installments: AccountingInstallment[],
  ): AccountingDuePayment[] {
    return installments
      .filter(
        (installment) =>
          installment.status !== AccountingInstallmentStatus.CANCELLED &&
          installment.remainingAmount > 0 &&
          installment.nextDueDate,
      )
      .map((installment) => {
        const dueMetrics = this.getDueMetrics(installment.nextDueDate as string);

        return {
          id: `installment-${installment.id}`,
          type: AccountingDuePaymentType.RECEIVABLE,
          entityName: installment.customerName,
          amount: installment.remainingAmount,
          dueDate: installment.nextDueDate as string,
          daysOverdue: dueMetrics.daysOverdue,
          invoiceNumber: installment.orderNumber,
          status: dueMetrics.status,
        };
      });
  }

  private getDueMetrics(dueDate: string) {
    const due = this.toStartOfDay(new Date(dueDate));
    const today = this.toStartOfDay(new Date());
    const diffMs = today.getTime() - due.getTime();
    const daysOverdue =
      diffMs > 0 ? Math.floor(diffMs / (1000 * 60 * 60 * 24)) : 0;

    if (daysOverdue > 0) {
      return {
        daysOverdue,
        status: AccountingDuePaymentStatus.OVERDUE,
      };
    }

    if (today.getTime() === due.getTime()) {
      return {
        daysOverdue: 0,
        status: AccountingDuePaymentStatus.DUE_TODAY,
      };
    }

    return {
      daysOverdue: 0,
      status: AccountingDuePaymentStatus.UPCOMING,
    };
  }

  private toStartOfDay(date: Date) {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }
}
