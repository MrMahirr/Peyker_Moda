import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportPeriod {
  THIS_MONTH = 'this_month',
  LAST_MONTH = 'last_month',
  LAST_3_MONTHS = 'last_3_months',
  THIS_YEAR = 'this_year',
}

export class GetReportQueryDto {
  @ApiPropertyOptional({
    enum: ReportPeriod,
    description: 'Rapor periyodu',
    default: ReportPeriod.THIS_MONTH,
  })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(ReportPeriod), {
    message: 'Geçersiz rapor periyodu. Lütfen geçerli bir zaman aralığı seçin.',
  })
  period?: ReportPeriod = ReportPeriod.THIS_MONTH;
}
