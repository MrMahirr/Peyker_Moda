import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIBAN,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  AccountingCheckStatus,
  AccountingCheckType,
  AccountingCurrentAccountType,
  AccountingDuePaymentType,
  AccountingRegisterType,
} from '../accounting.types';

export class CreateRegisterDto {
  @ApiProperty({ example: 'Magaza Kasasi' })
  @IsString()
  name: string;

  @ApiProperty({ enum: AccountingRegisterType })
  @IsEnum(AccountingRegisterType)
  type: AccountingRegisterType;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  balance?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateRegisterDto extends PartialType(CreateRegisterDto) {}

export class CreateBankAccountDto {
  @ApiProperty({ example: 'Ziraat Bankasi' })
  @IsString()
  bankName: string;

  @ApiProperty({ example: 'Peyker Moda TL' })
  @IsString()
  accountName: string;

  @ApiProperty({ example: 'TR000000000000000000000000' })
  @IsString()
  @IsIBAN()
  iban: string;

  @ApiPropertyOptional({ example: 'TRY' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  balance?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateBankAccountDto extends PartialType(CreateBankAccountDto) {}

export class CheckQueryDto {
  @ApiPropertyOptional({ enum: AccountingCheckType })
  @IsEnum(AccountingCheckType)
  @IsOptional()
  type?: AccountingCheckType;
}

export class CreateCheckDto {
  @ApiProperty({ enum: AccountingCheckType })
  @IsEnum(AccountingCheckType)
  type: AccountingCheckType;

  @ApiProperty({ example: 'CHK-2026-001' })
  @IsString()
  checkNumber: string;

  @ApiProperty({ example: 'Is Bankasi' })
  @IsString()
  bankName: string;

  @ApiProperty({ example: 15000 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: '2026-06-15' })
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({ enum: AccountingCheckStatus })
  @IsEnum(AccountingCheckStatus)
  @IsOptional()
  status?: AccountingCheckStatus;

  @ApiPropertyOptional({ example: 'Ayse Yilmaz' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional({ example: 'Tekstil Tedarik A.S.' })
  @IsString()
  @IsOptional()
  supplierName?: string;

  @ApiPropertyOptional({ example: 'Haziran tahsilati' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateCheckStatusDto {
  @ApiProperty({ enum: AccountingCheckStatus })
  @IsEnum(AccountingCheckStatus)
  status: AccountingCheckStatus;
}

export class RecordInstallmentPaymentDto {
  @ApiProperty({ example: 2500 })
  @IsNumber()
  @IsPositive()
  amount: number;
}

export class DuePaymentQueryDto {
  @ApiPropertyOptional({ enum: AccountingDuePaymentType })
  @IsEnum(AccountingDuePaymentType)
  @IsOptional()
  type?: AccountingDuePaymentType;
}

export class CurrentAccountQueryDto {
  @ApiPropertyOptional({ enum: AccountingCurrentAccountType })
  @IsEnum(AccountingCurrentAccountType)
  @IsOptional()
  type?: AccountingCurrentAccountType;
}

export class VatReportQueryDto {
  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;
}

export class PeriodSummaryQueryDto {
  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;
}

export class ClosePeriodDto extends PeriodSummaryQueryDto {}
