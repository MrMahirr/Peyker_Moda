import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DashboardQueryDto {
  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'Başlangıç tarihi',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31', description: 'Bitiş tarihi' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    example: 'day',
    description: 'Gruplama: day, week, month',
  })
  @IsString()
  @IsOptional()
  groupBy?: 'day' | 'week' | 'month';

  @ApiPropertyOptional({ example: 10, description: 'Limit' })
  @IsOptional()
  limit?: number | string;
}
