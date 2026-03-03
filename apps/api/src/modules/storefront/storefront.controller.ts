import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
} from '@nestjs/swagger';
import { StorefrontService } from './storefront.service';
import { StoreProductQueryDto, UpdateCartDto, CheckoutDto } from './dto';

@ApiTags('Storefront')
@Controller('store')
export class StorefrontController {
    constructor(private readonly storefrontService: StorefrontService) { }

    // ========== CATEGORIES ==========

    @Get('categories')
    @ApiOperation({ summary: 'Kategori listesi (tree yapısı)' })
    async getCategories() {
        return this.storefrontService.getCategories();
    }

    @Get('categories/:slug')
    @ApiOperation({ summary: 'Kategori detayı' })
    async getCategoryBySlug(@Param('slug') slug: string) {
        return this.storefrontService.getCategoryBySlug(slug);
    }

    // ========== PRODUCTS ==========

    @Get('products')
    @ApiOperation({ summary: 'Ürün listesi (filtreleme, sayfalama)' })
    async getProducts(@Query() query: StoreProductQueryDto) {
        return this.storefrontService.getProducts(query);
    }

    @Get('products/:slug')
    @ApiOperation({ summary: 'Ürün detayı' })
    async getProductBySlug(@Param('slug') slug: string) {
        return this.storefrontService.getProductBySlug(slug);
    }

    // ========== CART ==========

    @Post('cart/calculate')
    @ApiOperation({ summary: 'Sepet hesapla' })
    async calculateCart(
        @Body() cartDto: UpdateCartDto,
        @Query('coupon') couponCode?: string,
    ) {
        return this.storefrontService.calculateCart(cartDto.items, couponCode);
    }

    // ========== CHECKOUT ==========

    @Post('checkout')
    @ApiOperation({ summary: 'Sipariş oluştur' })
    @ApiResponse({ status: 201, description: 'Sipariş oluşturuldu' })
    async checkout(@Body() checkoutDto: CheckoutDto) {
        return this.storefrontService.checkout(checkoutDto);
    }

    // ========== ORDER TRACKING ==========

    @Get('orders/track')
    @ApiOperation({ summary: 'Sipariş takibi' })
    async trackOrder(
        @Query('orderNumber') orderNumber: string,
        @Query('phone') phone: string,
    ) {
        return this.storefrontService.trackOrder(orderNumber, phone);
    }
}
