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
21: 
22:     // ========== HOME / SETTINGS ==========
23: 
24:     @Get('banners')
25:     @ApiOperation({ summary: 'Banner/Hero listesi' })
26:     async getBanners(@Query('position') position?: string) {
27:         return this.storefrontService.getBanners(position);
28:     }
29: 
30:     @Get('attributes')
31:     @ApiOperation({ summary: 'Filtreleme özellikleri (beden, renk vb.)' })
32:     async getAttributes() {
33:         return this.storefrontService.getAttributes();
34:     }

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

    @Get('collections/:slug')
    @ApiOperation({ summary: 'Koleksiyon/Kampanya detayı' })
    async getCollectionBySlug(@Param('slug') slug: string) {
        return this.storefrontService.getCollectionBySlug(slug);
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
