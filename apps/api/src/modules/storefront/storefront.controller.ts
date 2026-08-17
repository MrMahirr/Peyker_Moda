import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Patch,
  Param,
  Query,
  UseGuards,
  Req,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { StorefrontService } from './storefront.service';
import {
  StoreProductQueryDto,
  UpdateCartDto,
  CheckoutDto,
  CustomerLoginDto,
  CustomerRegisterDto,
  GoogleLoginDto,
  TrackOrderDto,
} from './dto';
import { CreateCustomerReturnDto } from '../returns/dto';
import {
  CustomerJwtAuthGuard,
  OptionalCustomerJwtAuthGuard,
} from '../../common/guards';

const PublicStoreReadThrottle = Throttle({
  default: { limit: 500, ttl: 60000 },
});

@ApiTags('Storefront')
@Controller('store')
export class StorefrontController {
  constructor(private readonly storefrontService: StorefrontService) {}

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

  @Put('auth/profile')
  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth('JWT-customer')
  @ApiOperation({ summary: 'Müşteri Profil Bilgilerini Güncelle' })
  async updateProfile(@Req() req: any, @Body() body: any) {
    return this.storefrontService.updateCustomerProfile(req.user.id, body);
  }

  // ========== HOME / SETTINGS ==========

  @Get('banners')
  @PublicStoreReadThrottle
  @ApiOperation({ summary: 'Banner/Hero listesi' })
  async getBanners(@Query('position') position?: string) {
    return this.storefrontService.getBanners(position);
  }

  @Get('attributes')
  @PublicStoreReadThrottle
  @ApiOperation({ summary: 'Filtreleme özellikleri (beden, renk vb.)' })
  async getAttributes(@Query('categorySlug') categorySlug?: string) {
    return this.storefrontService.getAttributes(categorySlug);
  }

  // ========== PUBLIC CONTENT ==========

  @Get('page-headers/:pageSlug')
  @PublicStoreReadThrottle
  @ApiOperation({ summary: 'Kategori sayfası banner detayı' })
  async getPageHeader(@Param('pageSlug') pageSlug: string) {
    return this.storefrontService.getPageHeader(pageSlug);
  }

  @Get('collection-content')
  @PublicStoreReadThrottle
  @ApiOperation({ summary: 'Koleksiyonları keşfet içeriği' })
  async getCollectionContent() {
    return this.storefrontService.getCollectionContent();
  }

  // ========== CATEGORIES ==========

  @Get('categories')
  @PublicStoreReadThrottle
  @ApiOperation({ summary: 'Kategori listesi (tree yapısı)' })
  async getCategories() {
    return this.storefrontService.getCategories();
  }

  @Get('categories/:slug')
  @PublicStoreReadThrottle
  @ApiOperation({ summary: 'Kategori detayı' })
  async getCategoryBySlug(@Param('slug') slug: string) {
    return this.storefrontService.getCategoryBySlug(slug);
  }

  @Get('collections/:slug')
  @PublicStoreReadThrottle
  @ApiOperation({ summary: 'Koleksiyon/Kampanya detayı' })
  async getCollectionBySlug(@Param('slug') slug: string) {
    return this.storefrontService.getCollectionBySlug(slug);
  }

  // ========== PRODUCTS ==========

  @Get('products')
  @PublicStoreReadThrottle
  @ApiOperation({ summary: 'Ürün listesi (filtreleme, sayfalama)' })
  async getProducts(@Query() query: StoreProductQueryDto) {
    return this.storefrontService.getProducts(query);
  }

  @Get('products/:slug')
  @PublicStoreReadThrottle
  @ApiOperation({ summary: 'Ürün detayı' })
  async getProductBySlug(@Param('slug') slug: string) {
    return this.storefrontService.getProductBySlug(slug);
  }

  // ========== FAVORITES ==========

  @Get('favorites')
  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth('JWT-customer')
  @ApiOperation({ summary: 'Müşterinin Favorileri' })
  async getFavorites(@Req() req: any) {
    return this.storefrontService.getFavorites(req.user.id);
  }

  @Post('favorites/:productId')
  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth('JWT-customer')
  @ApiOperation({ summary: 'Favorilere Ekle' })
  async addFavorite(@Req() req: any, @Param('productId') productId: string) {
    return this.storefrontService.addFavorite(req.user.id, productId);
  }

  @Delete('favorites/:productId')
  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth('JWT-customer')
  @ApiOperation({ summary: 'Favorilerden Çıkar' })
  async removeFavorite(@Req() req: any, @Param('productId') productId: string) {
    return this.storefrontService.removeFavorite(req.user.id, productId);
  }

  // ========== ADDRESSES ==========

  @Get('addresses')
  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth('JWT-customer')
  @ApiOperation({ summary: 'Müşterinin Adresleri' })
  async getAddresses(@Req() req: any) {
    return this.storefrontService.getAddresses(req.user.id);
  }

  @Post('addresses')
  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth('JWT-customer')
  @ApiOperation({ summary: 'Yeni Adres Ekle' })
  async addAddress(@Req() req: any, @Body() body: any) {
    return this.storefrontService.addAddress(req.user.id, body);
  }

  @Put('addresses/:id')
  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth('JWT-customer')
  @ApiOperation({ summary: 'Adres Güncelle' })
  async updateAddress(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.storefrontService.updateAddress(req.user.id, id, body);
  }

  @Delete('addresses/:id')
  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth('JWT-customer')
  @ApiOperation({ summary: 'Adres Sil' })
  async deleteAddress(@Req() req: any, @Param('id') id: string) {
    return this.storefrontService.deleteAddress(req.user.id, id);
  }

  @Patch('addresses/:id/default')
  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth('JWT-customer')
  @ApiOperation({ summary: 'Varsayılan Adres Yap' })
  async setDefaultAddress(@Req() req: any, @Param('id') id: string) {
    return this.storefrontService.setDefaultAddress(req.user.id, id);
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
  @UseGuards(OptionalCustomerJwtAuthGuard)
  @ApiOperation({ summary: 'Sipariş oluştur' })
  @ApiResponse({ status: 201, description: 'Sipariş oluşturuldu' })
  async checkout(@Req() req: any, @Body() checkoutDto: CheckoutDto) {
    return this.storefrontService.checkout(checkoutDto, req.user?.id);
  }

  // ========== ORDER TRACKING ==========

  @Get('orders')
  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth('JWT-customer')
  @ApiOperation({ summary: 'Müşterinin Siparişleri' })
  async getOrders(@Req() req: any) {
    return this.storefrontService.getCustomerOrders(req.user.id);
  }

  @Post('orders/track')
  @ApiOperation({ summary: 'Sipariş takibi' })
  async trackOrder(@Body() trackOrderDto: TrackOrderDto) {
    return this.storefrontService.trackOrder(
      trackOrderDto.orderNumber,
      trackOrderDto.phone,
    );
  }

  @Post('orders/:id/return')
  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth('JWT-customer')
  @ApiOperation({ summary: 'İade Talebi Oluştur' })
  async createReturn(
    @Req() req: any,
    @Param('id') orderId: string,
    @Body() body: CreateCustomerReturnDto,
  ) {
    return this.storefrontService.createReturn(req.user.id, orderId, body);
  }

  @Get('orders/:id/invoice')
  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth('JWT-customer')
  @ApiOperation({ summary: 'Sipariş Faturası Al' })
  async getOrderInvoice(@Req() req: any, @Param('id') orderId: string) {
    return this.storefrontService.getOrderInvoice(req.user.id, orderId);
  }
}
