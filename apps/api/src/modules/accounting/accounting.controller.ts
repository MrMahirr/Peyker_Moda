import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { CurrentUser, Roles } from '../../common/decorators';
import { AccountingCurrentAccountsService } from './accounting-current-accounts.service';
import { AccountingService } from './accounting.service';
import {
  CheckQueryDto,
  ClosePeriodDto,
  CurrentAccountQueryDto,
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

@ApiTags('Accounting')
@Controller('accounting')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AccountingController {
  constructor(
    private readonly accountingService: AccountingService,
    private readonly accountingCurrentAccountsService: AccountingCurrentAccountsService,
  ) {}

  @Get('registers')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Kasalari listele' })
  @ApiResponse({ status: 200, description: 'Kasa listesi doner' })
  async getRegisters() {
    return this.accountingService.getRegisters();
  }

  @Post('registers')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Yeni kasa olustur' })
  async createRegister(@Body() dto: CreateRegisterDto) {
    return this.accountingService.createRegister(dto);
  }

  @Patch('registers/:id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Kasayi guncelle' })
  async updateRegister(
    @Param('id') id: string,
    @Body() dto: UpdateRegisterDto,
  ) {
    return this.accountingService.updateRegister(id, dto);
  }

  @Get('bank-accounts')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Banka hesaplarini listele' })
  async getBankAccounts() {
    return this.accountingService.getBankAccounts();
  }

  @Post('bank-accounts')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Banka hesabi olustur' })
  async createBankAccount(@Body() dto: CreateBankAccountDto) {
    return this.accountingService.createBankAccount(dto);
  }

  @Patch('bank-accounts/:id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Banka hesabini guncelle' })
  async updateBankAccount(
    @Param('id') id: string,
    @Body() dto: UpdateBankAccountDto,
  ) {
    return this.accountingService.updateBankAccount(id, dto);
  }

  @Delete('bank-accounts/:id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Banka hesabini sil' })
  async deleteBankAccount(@Param('id') id: string) {
    return this.accountingService.deleteBankAccount(id);
  }

  @Get('checks')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Cek ve senetleri listele' })
  async getChecks(@Query() query: CheckQueryDto) {
    return this.accountingService.getChecks(query);
  }

  @Post('checks')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Yeni cek veya senet olustur' })
  async createCheck(@Body() dto: CreateCheckDto) {
    return this.accountingService.createCheck(dto);
  }

  @Patch('checks/:id/status')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Cek veya senet durumunu guncelle' })
  async updateCheckStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCheckStatusDto,
  ) {
    return this.accountingService.updateCheckStatus(id, dto);
  }

  @Get('installments')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Taksitleri listele' })
  async getInstallments() {
    return this.accountingService.getInstallments();
  }

  @Post('installments/:id/pay')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Taksit odemesi kaydet' })
  async recordInstallmentPayment(
    @Param('id') id: string,
    @Body() dto: RecordInstallmentPaymentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.accountingService.recordInstallmentPayment(id, dto, userId);
  }

  @Get('current-accounts')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Cari hesaplari listele' })
  async getCurrentAccounts(@Query() query: CurrentAccountQueryDto) {
    return this.accountingCurrentAccountsService.getCurrentAccounts(query);
  }

  @Get('due-payments')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Vadeli alacak ve borclari listele' })
  async getDuePayments(@Query() query: DuePaymentQueryDto) {
    return this.accountingService.getDuePayments(query);
  }

  @Get('reports/z-report')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Satış Raporunu getir (Z-Raporu, Haftalık, Aylık)' })
  async getZReport(@Query('period') period?: string) {
    return this.accountingService.getZReport(period);
  }

  @Post('reports/z-report/close')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Günlük Z-Raporunu Kes (Günü Kapat)' })
  async closeZReport() {
    return this.accountingService.closeZReport();
  }

  @Get('reports/vat')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'KDV raporunu getir' })
  async getVatReport(@Query() query: VatReportQueryDto) {
    return this.accountingService.getVatReport(query);
  }

  @Get('reports/period')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Donem ozetini getir' })
  async getPeriodSummary(@Query() query: PeriodSummaryQueryDto) {
    return this.accountingService.getPeriodSummary(query);
  }

  @Post('reports/close-period')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Donemi kapat' })
  async closePeriod(
    @Body() dto: ClosePeriodDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.accountingService.closePeriod(dto, userId);
  }
}
