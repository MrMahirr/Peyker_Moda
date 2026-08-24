import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  Min,
  IsUUID,
  IsArray,
  ValidateNested,
  IsEmail,
  IsEnum,
  IsBooleanString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

// ========== CART ==========

export class CartItemDto {
  @ApiProperty({ example: 'variant-uuid' })
  @IsUUID()
  variantId: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class UpdateCartDto {
  @ApiProperty({ type: [CartItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];
}

// ========== CHECKOUT ==========

export class ShippingAddressDto {
  @ApiProperty({ example: 'Ahmet Yılmaz' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: '05551234567' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: 'ahmet@email.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'Atatürk Mah. Cumhuriyet Cad. No:123' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'İstanbul' })
  @IsString()
  city: string;

  @ApiPropertyOptional({ example: 'Kadıköy' })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiPropertyOptional({ example: '34000' })
  @IsString()
  @IsOptional()
  postalCode?: string;
}

export class CheckoutDto {
  @ApiProperty({ type: [CartItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];

  @ApiProperty({ type: ShippingAddressDto })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @ApiProperty({ enum: PaymentMethod, example: 'CREDIT_CARD' })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ example: 'SUMMER20' })
  @IsString()
  @IsOptional()
  couponCode?: string;

  @ApiPropertyOptional({ example: 'Lütfen kapıya bırakın' })
  @IsString()
  @IsOptional()
  notes?: string;
}

// ========== PRODUCT QUERY ==========

export class StoreProductQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 12 })
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ example: 'category-uuid' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'aksesuar' })
  @IsString()
  @IsOptional()
  categorySlug?: string;

  @ApiPropertyOptional({ example: 'elbise' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxPrice?: number;

  @ApiPropertyOptional({
    example: 'price_asc',
    description: 'Sıralama: price_asc, price_desc, newest, popular',
  })
  @IsString()
  @IsOptional()
  sort?: string;

  @ApiPropertyOptional({
    example: 'true',
    description: 'Sadece indirimli urunler',
  })
  @IsBooleanString()
  @IsOptional()
  onSale?: string;

  @ApiPropertyOptional({
    example: 'M,L',
    description: 'Bedenler (virgül ile ayrılmış)',
  })
  @IsString()
  @IsOptional()
  sizes?: string;

  @ApiPropertyOptional({
    example: 'black,red',
    description: 'Renkler (virgül ile ayrılmış)',
  })
  @IsString()
  @IsOptional()
  colors?: string;
}

// ========== CUSTOMER AUTH ==========

export class CustomerLoginDto {
  @ApiProperty({ example: 'musteri@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Sifre123!' })
  @IsString()
  password: string;
}

export class CustomerRegisterDto {
  @ApiProperty({ example: 'Ahmet' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Yılmaz' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'ahmet@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '05551234567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Sifre123!' })
  @IsString()
  password: string;
}

export class GoogleLoginDto {
  @ApiProperty({ example: 'eyJhbGciOi...' })
  @IsString()
  idToken: string;
}

export class TrackOrderDto {
  @ApiProperty({ example: '26082404321' })
  @IsString()
  orderNumber: string;

  @ApiProperty({ example: '05551234567' })
  @IsString()
  phone: string;
}
