import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsHexColor,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateLoyaltyTierDto {
  @ApiProperty({ example: 'Platinum' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  @Min(0)
  minSpent: number;

  @ApiProperty({ example: 12 })
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent: number;

  @ApiProperty({ example: 1.75 })
  @IsNumber()
  @Min(0)
  pointMultiplier: number;

  @ApiProperty({ example: '#7C3AED' })
  @IsHexColor()
  color: string;
}

export class UpdateLoyaltyTierDto extends PartialType(CreateLoyaltyTierDto) {}

export class AddLoyaltyPointsDto {
  @ApiProperty({ example: 150 })
  @IsNumber()
  @IsPositive()
  points: number;

  @ApiProperty({ example: 'Musteri memnuniyeti telafisi' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
