import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportPeriod {
    THIS_MONTH = 'this_month',
    LAST_MONTH = 'last_month',
    LAST_3_MONTHS = 'last_3_months',
    THIS_YEAR = 'this_year',
}

export class GetReportQueryDto {
    @ApiPropertyOptional({ enum: ReportPeriod, description: 'Rapor periyodu', default: ReportPeriod.THIS_MONTH })
    @IsEnum(ReportPeriod)
    @IsOptional()
    period?: ReportPeriod = ReportPeriod.THIS_MONTH;
}
