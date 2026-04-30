import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AccountingController } from './accounting.controller';
import { AccountingCurrentAccountsService } from './accounting-current-accounts.service';
import { AccountingDuePaymentService } from './accounting-due-payment.service';
import { AccountingReportService } from './accounting-report.service';
import { AccountingService } from './accounting.service';
import { AccountingStorageService } from './accounting-storage.service';

@Module({
  imports: [PrismaModule],
  controllers: [AccountingController],
  providers: [
    AccountingService,
    AccountingStorageService,
    AccountingReportService,
    AccountingCurrentAccountsService,
    AccountingDuePaymentService,
  ],
})
export class AccountingModule {}
