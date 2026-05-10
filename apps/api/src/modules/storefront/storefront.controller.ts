import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    Req,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { StorefrontService } from './storefront.service';
import { StoreProductQueryDto, UpdateCartDto, CheckoutDto, CustomerLoginDto, CustomerRegisterDto, GoogleLoginDto, TrackOrderDto } from './dto';
import { CustomerJwtAuthGuard } from '../../common/guards';

@ApiTags('Storefront')
@Controller('store')
export class StorefrontController {
    constructor(private readonly storefrontService: StorefrontService) { }

    // ========== AUTHENTICATION ==========

    @Post('auth/google')
    @ApiOperation({ summary: 'Google ile Giriş Yap / Kayıt Ol' })
    @ApiResponse({ status: 200, description: 'Başarılı Google girişi' })
    async loginGoogle(@Body() googleLoginDto: GoogleLoginDto) {
        return this.storefrontService.loginGoogle(googleLoginDto);
    }

    @Post('auth/login')
    @ApiOperation({ summary: 'Müşteri Girişi' })
    @ApiResponse({ status: 200, description: 'Başarılı giriş' })
    async login(@Body() loginDto: CustomerLoginDto) {
        return this.storefrontService.loginCustomer(loginDto);
    }

    @Post('auth/register')
    @ApiOperation({ summary: 'Müşteri Kaydı' })
    @ApiResponse({ status: 201, description: 'Başarılı kayıt' })
    async register(@Body() registerDto: CustomerRegisterDto) {
        return this.storefrontService.registerCustomer(registerDto);
    }

    @Get('auth/me')
    @UseGuards(CustomerJwtAuthGuard)
    @ApiBearerAuth('JWT-customer')
    @ApiOperation({ summary: 'Giriş Yapan Müşteri Bilgileri' })
    @ApiResponse({ status: 200, description: 'Müşteri bilgileri' })
    async getProfile(@Req() req: any) {
        return req.user;
    }

    // ========== HOME / SETTINGS ==========

    @Get('banners')
    @ApiOperation({ summary: 'Banner/Hero listesi' })
    async getBanners(@Query('position') position?: string) {
        return this.storefrontService.getBanners(position);
    }

    @Get('attributes')
    @ApiOperation({ summary: 'Filtreleme özellikleri (beden, renk vb.)' })
    async getAttributes() {
        return this.storefrontService.getAttributes();
    }

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

    @Post('orders/track')
    @ApiOperation({ summary: 'Sipariş takibi' })
    async trackOrder(@Body() trackOrderDto: TrackOrderDto) {
        return this.storefrontService.trackOrder(trackOrderDto.orderNumber, trackOrderDto.phone);
    }
}
