import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../../prisma/prisma.service';
import {
  StoreProductQueryDto,
  CheckoutDto,
  CartItemDto,
  CustomerLoginDto,
  CustomerRegisterDto,
  GoogleLoginDto,
} from './dto';
import { CampaignsService } from '../campaigns/campaigns.service';
import { EmailService } from '../email/email.service';
import { InvoicesService } from '../invoices/invoices.service';
import { CreateCustomerReturnDto } from '../returns/dto';
import { HydratedReturn, ReturnsService } from '../returns/returns.service';
import {
  getPaginationParams,
  createPaginatedResult,
  generateOrderNumber,
} from '../../common/utils';
import {
  OrderSource,
  OrderStatus,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import { PageHeaderStorageService } from '../banners/page-header.storage.service';
import { BannerStorageService } from '../banners/banner.storage.service';
import { PriceListsService } from '../price-lists/price-lists.service';
import { PriceListResponse, PriceListScopeType, PriceListEffectiveStatus, PriceListAdjustmentType } from '../price-lists/price-lists.types';
import { CollectionsService } from '../collections/collections.service';

@Injectable()
export class StorefrontService {
  private readonly logger = new Logger(StorefrontService.name);

  constructor(
    private prisma: PrismaService,
    private campaignsService: CampaignsService,
    private emailService: EmailService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private pageHeaderStorage: PageHeaderStorageService,
    private bannerStorage: BannerStorageService,
    private invoicesService: InvoicesService,
    private returnsService: ReturnsService,
    private priceListsService: PriceListsService,
    private collectionsService: CollectionsService,
  ) {}

  // ========== AUTHENTICATION ==========

  async loginGoogle(dto: GoogleLoginDto) {
    const clientId = this.configService.get<string>('app.googleClientId');
    if (!clientId) {
      this.logger.error('Google Client ID configuration is missing.');
      throw new BadRequestException('Google giriş sistemi şu an aktif değil.');
    }

    const client = new OAuth2Client(clientId);
    let payload;

    try {
      const ticket = await client.verifyIdToken({
        idToken: dto.idToken,
        audience: clientId,
      });
      payload = ticket.getPayload();
    } catch (error) {
      this.logger.error('Failed to verify Google ID Token:', error);
      throw new UnauthorizedException('Geçersiz Google kimlik doğrulaması.');
    }

    if (!payload || !payload.email) {
      throw new BadRequestException(
        'Google profilinden geçerli bir e-posta adresi alınamadı.',
      );
    }

    const email = payload.email;
    const googleId = payload.sub;
    const firstName = payload.given_name || 'Google';
    const lastName = payload.family_name || 'Kullanıcısı';

    // Find customer by Google ID or by Email
    let customer = await this.prisma.customer.findFirst({
      where: {
        OR: [{ googleId }, { email }],
      },
    });

    if (customer) {
      // If they match by email but didn't have googleId linked, update it
      if (!customer.googleId) {
        customer = await this.prisma.customer.update({
          where: { id: customer.id },
          data: { googleId },
        });
      }
    } else {
      // Create a new customer
      customer = await this.prisma.customer.create({
        data: {
          email,
          googleId,
          firstName,
          lastName,
          isActive: true,
        },
      });
    }

    if (!customer.isActive) {
      throw new UnauthorizedException('Bu hesap aktif değil.');
    }

    const jwtPayload = {
      sub: customer.id,
      email: customer.email,
      type: 'CUSTOMER',
    };
    const accessToken = this.jwtService.sign(jwtPayload);

    return {
      accessToken,
      user: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
      },
    };
  }

  async loginCustomer(dto: CustomerLoginDto) {
    const customer = await this.prisma.customer.findFirst({
      where: { email: dto.email },
    });

    if (!customer || !customer.isActive) {
      throw new UnauthorizedException(
        'Giriş başarısız. Bilgilerinizi kontrol edin.',
      );
    }

    if (!customer.password) {
      throw new UnauthorizedException(
        'Bu hesap için şifre tanımlanmamış. Lütfen şifremi unuttum adımını kullanın veya yeni kayıt olun.',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      customer.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Giriş başarısız. Bilgilerinizi kontrol edin.',
      );
    }

    const payload = {
      sub: customer.id,
      email: customer.email,
      type: 'CUSTOMER',
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
      },
    };
  }

  async registerCustomer(dto: CustomerRegisterDto) {
    const existingCustomer = await this.prisma.customer.findFirst({
      where: { email: dto.email },
    });

    if (existingCustomer) {
      throw new ConflictException('Bu e-posta adresi zaten kullanılıyor.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const customer = await this.prisma.customer.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        password: hashedPassword,
      },
    });

    return {
      success: true,
      message: 'Kayıt başarılı. Şimdi giriş yapabilirsiniz.',
    };
  }

  // ========== HOME / SETTINGS ==========

  async getBanners(position?: string) {
    const banners = await this.bannerStorage.getBanners();
    return banners
      .filter((b) => b.isActive)
      .sort((a, b) => a.position - b.position)
      .map((b) => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        imageUrl: b.imageUrl,
        ctaText: b.ctaText,
        ctaLink: b.ctaLink,
        position: b.position,
      }));
  }

  async getAttributes(categorySlug?: string) {
    // Tüm varyantlardan benzersiz beden ve renkleri çek
    const where: any = { stock: { gt: 0 } };

    if (categorySlug) {
      where.product = {
        category: { slug: categorySlug },
      };
    }

    const variants = await this.prisma.variant.findMany({
      where,
      select: { size: true, color: true },
    });

    const sizes = Array.from(new Set(variants.map((v) => v.size)))
      .filter(Boolean)
      .sort();
    const colors = Array.from(new Set(variants.map((v) => v.color)))
      .filter(Boolean)
      .sort();

    return {
      sizes,
      colors: colors.map((c) => ({ name: c, value: c })),
    };
  }

  async getPageHeader(pageSlug: string) {
    const headers = await this.pageHeaderStorage.getPageHeaders();
    const header = headers.find((h) => h.pageSlug === pageSlug && h.isActive);
    return header || null;
  }

  /**
   * Ana sayfada gösterilecek aktif koleksiyonlar (kapak görseli + link için)
   */
  async getActiveCollections() {
    const collections = await this.collectionsService.findAll({
      isActive: true,
    });
    return collections.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      imageUrl: c.imageUrl,
    }));
  }

  // ========== CATEGORIES ==========

  /**
   * Mağaza kategorileri (aktif, parent-child yapısı)
   */
  async getCategories() {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ parentId: 'asc' }, { order: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        parentId: true,
      },
    });

    // Tree yapısına dönüştür
    const buildTree = (parentId: string | null): any[] => {
      return categories
        .filter((c) => c.parentId === parentId)
        .map((c) => ({
          ...c,
          children: buildTree(c.id),
        }));
    };

    return buildTree(null);
  }

  /**
   * Kategori detayı
   */
  async getCategoryBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
    });

    if (!category) {
      throw new NotFoundException('Kategori bulunamadı');
    }

    return category;
  }

  async getCollectionBySlug(slug: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            basePrice: true,
            salePrice: true,
            images: true,
            category: { select: { id: true, name: true, slug: true } },
            variants: {
              where: { stock: { gt: 0 } },
              select: { id: true, size: true, color: true, stock: true },
              take: 5,
            },
            _count: { select: { variants: true } },
          },
        },
      },
    });

    if (!collection || !collection.isActive) {
      throw new NotFoundException('Koleksiyon bulunamadı');
    }

    const campaigns = await this.campaignsService.getActiveCampaigns();
    const allPriceLists = await this.priceListsService.findAll();
    const activePriceLists = allPriceLists.filter(
      (pl) => pl.effectiveStatus === 'ACTIVE',
    );

    return {
      id: collection.id,
      title: collection.name,
      description: collection.description || '',
      coverImage: collection.imageUrl || '/peyker-moda-kapak1.png',
      accentColor: 'bg-amber-500',
      products: this.applyStorefrontPricing(
        collection.products,
        campaigns,
        activePriceLists,
      ),
    };
  }

  // ========== PRODUCTS ==========

  /**
   * Mağaza ürün listesi
   */
  async getProducts(query: StoreProductQueryDto) {
    const { page, limit, skip } = getPaginationParams(query);

    const where: any = {
      isActive: true,
    };

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.categorySlug) {
      if (query.categorySlug === 'giyim') {
        where.category = {
          slug: {
            in: ['elbise', 'ust-giyim', 'dis-giyim', 'alt-giyim'],
          },
        };
      } else {
        where.category = {
          slug: query.categorySlug,
        };
      }
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.minPrice || query.maxPrice) {
      where.basePrice = {};
      if (query.minPrice) where.basePrice.gte = query.minPrice;
      if (query.maxPrice) where.basePrice.lte = query.maxPrice;
    }

    if (query.sizes || query.colors) {
      where.variants = {
        some: {
          stock: { gt: 0 },
        },
      };
      if (query.sizes) {
        where.variants.some.size = { in: query.sizes.split(',') };
      }
      if (query.colors) {
        where.variants.some.color = { in: query.colors.split(',') };
      }
    }

    // Sıralama
    const campaigns = await this.campaignsService.getActiveCampaigns();
    const allPriceLists = await this.priceListsService.findAll();
    const activePriceLists = allPriceLists.filter(pl => pl.effectiveStatus === 'ACTIVE');

    const productSelect = {
      id: true,
      name: true,
      slug: true,
      description: true,
      basePrice: true,
      salePrice: true,
      images: true,
      category: { select: { id: true, name: true, slug: true } },
      variants: {
        where: { stock: { gt: 0 } },
        select: { id: true, size: true, color: true, stock: true },
        take: 5,
      },
      _count: { select: { variants: true } },
    } as const;

    const usesComputedPrice =
      query.sort === 'price_asc' ||
      query.sort === 'price_desc' ||
      query.sort === 'discount' ||
      query.onSale === 'true';

    if (usesComputedPrice) {
      const products = await this.prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: productSelect,
      });

      let productsWithDiscounts = this.applyStorefrontPricing(
        products,
        campaigns,
        activePriceLists,
      );

      if (query.onSale === 'true') {
        productsWithDiscounts = productsWithDiscounts.filter(
          (product) => this.calculateBestPrice(product, campaigns, activePriceLists).discountAmount > 0,
        );
      }

      productsWithDiscounts.sort((a, b) => {
        const aPricing = this.calculateBestPrice(a, campaigns, activePriceLists);
        const bPricing = this.calculateBestPrice(b, campaigns, activePriceLists);

        switch (query.sort) {
          case 'price_asc':
            return aPricing.finalPrice - bPricing.finalPrice;
          case 'price_desc':
            return bPricing.finalPrice - aPricing.finalPrice;
          case 'discount':
            return bPricing.discountPercent - aPricing.discountPercent;
          default:
            return 0;
        }
      });

      const total = productsWithDiscounts.length;
      const pagedProducts = productsWithDiscounts.slice(skip, skip + limit);

      return createPaginatedResult(pagedProducts, total, page, limit);
    }

    let orderBy: any = { createdAt: 'desc' };
    if (query.sort) {
      switch (query.sort) {
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
        case 'popular':
        case 'bestseller':
          orderBy = { viewCount: 'desc' };
          break;
      }
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: productSelect,
      }),
      this.prisma.product.count({ where }),
    ]);

    const productsWithDiscounts = this.applyStorefrontPricing(
      products,
      campaigns,
      activePriceLists,
    );

    return createPaginatedResult(productsWithDiscounts, total, page, limit);
  }

  /**
   * Storefront pricing helpers
   */
  private applyStorefrontPricing(products: any[], campaigns: any[], priceLists: PriceListResponse[]) {
    return products.map((product) => {
      const pricing = this.calculateBestPrice(product, campaigns, priceLists);

      return {
        ...product,
        salePrice: pricing.finalPrice < Number(product.basePrice) ? pricing.finalPrice : product.salePrice,
      };
    });
  }

  private calculateBestPrice(product: any, campaigns: any[], priceLists: PriceListResponse[]) {
    const basePrice = Number(product.basePrice ?? 0);
    const initialSalePrice = product.salePrice !== null && product.salePrice !== undefined
      ? Number(product.salePrice)
      : basePrice;

    let bestPrice = initialSalePrice;

    // Check campaigns
    for (const campaign of campaigns) {
      const applies =
        (campaign.productIds as string[])?.includes(product.id) ||
        (campaign.categoryIds as string[])?.includes(product.category?.id || '');

      if (applies) {
        let campaignPrice = basePrice;
        if (campaign.discountType === 'PERCENTAGE') {
          campaignPrice = basePrice - (basePrice * (Number(campaign.discountValue) / 100));
        } else if (campaign.discountType === 'FIXED_AMOUNT') {
          campaignPrice = basePrice - Number(campaign.discountValue);
        }
        
        campaignPrice = Math.max(0, campaignPrice);
        if (campaignPrice < bestPrice) bestPrice = campaignPrice;
      }
    }

    // Check price lists
    for (const pl of priceLists) {
      const applies = 
        pl.scopeType === 'ALL_PRODUCTS' ||
        (pl.scopeType === 'PRODUCT' && pl.productId === product.id) ||
        (pl.scopeType === 'CATEGORY' && pl.categoryId === product.category?.id);
        
      if (applies) {
        let plPrice = basePrice;
        if (pl.adjustmentType === 'PERCENTAGE_DISCOUNT') {
          plPrice = basePrice - (basePrice * (Number(pl.amount) / 100));
        } else if (pl.adjustmentType === 'FIXED_DISCOUNT') {
          plPrice = basePrice - Number(pl.amount);
        } else if (pl.adjustmentType === 'FIXED_PRICE') {
          plPrice = Number(pl.amount);
        }

        plPrice = Math.max(0, plPrice);
        if (plPrice < bestPrice) bestPrice = plPrice;
      }
    }

    const discountAmount = Math.max(0, basePrice - bestPrice);

    return {
      finalPrice: bestPrice,
      discountAmount,
      discountPercent: basePrice > 0 ? (discountAmount / basePrice) * 100 : 0,
    };
  }

  async getProductBySlug(slug: string) {
    const campaigns = await this.campaignsService.getActiveCampaigns();
    const allPriceLists = await this.priceListsService.findAll();
    const activePriceLists = allPriceLists.filter(pl => pl.effectiveStatus === 'ACTIVE');

    let product = await this.prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: {
          where: { stock: { gt: 0 } },
          select: {
            id: true,
            sku: true,
            size: true,
            color: true,
            stock: true,
            price: true,
          },
          orderBy: [{ size: 'asc' }, { color: 'asc' }],
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    // Görüntülenme sayısını artır
    await this.prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    });

    // İlgili ürünler
    const relatedProducts = await this.prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
      },
      take: 4,
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        salePrice: true,
        images: true,
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    const pricing = this.calculateBestPrice(product, campaigns, activePriceLists);
    if (pricing.finalPrice < Number(product.basePrice)) {
      product.salePrice = new Prisma.Decimal(pricing.finalPrice);
    }

    const relatedProductsWithDiscounts = this.applyStorefrontPricing(
      relatedProducts,
      campaigns,
      activePriceLists,
    );

    return {
      ...product,
      relatedProducts: relatedProductsWithDiscounts,
    };
  }

  // ========== FAVORITES ==========

  async updateCustomerProfile(
    customerId: string,
    data: { firstName?: string; lastName?: string; phone?: string },
  ) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) throw new NotFoundException('Müşteri bulunamadı');

    if (data.phone && data.phone !== customer.phone) {
      const phoneExists = await this.prisma.customer.findFirst({
        where: { phone: data.phone },
      });
      if (phoneExists) {
        throw new BadRequestException(
          'Bu telefon numarası başka bir hesaba aittir.',
        );
      }
    }

    const updated = await this.prisma.customer.update({
      where: { id: customerId },
      data: {
        firstName:
          data.firstName !== undefined ? data.firstName : customer.firstName,
        lastName:
          data.lastName !== undefined ? data.lastName : customer.lastName,
        phone: data.phone !== undefined ? data.phone : customer.phone,
      },
    });

    const { password, ...result } = updated;
    return result;
  }

  // ========== HOME / SETTINGS ==========

  async getFavorites(customerId: string) {
    const campaigns = await this.campaignsService.getActiveCampaigns();
    const allPriceLists = await this.priceListsService.findAll();
    const activePriceLists = allPriceLists.filter(pl => pl.effectiveStatus === 'ACTIVE');

    const favorites = await this.prisma.favorite.findMany({
      where: { customerId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            salePrice: true,
            images: true,
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((fav) => {
      const product = fav.product;
      const images = product.images as string[];
      const pricing = this.calculateBestPrice(product, campaigns, activePriceLists);
      
      const price = pricing.finalPrice;
      const compareAtPrice = price < Number(product.basePrice)
        ? Number(product.basePrice)
        : undefined;
        
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price,
        compareAtPrice,
        image: images?.[0] || '',
        category: product.category?.name || 'Giyim',
        inStock: true,
      };
    });
  }

  async addFavorite(customerId: string, productId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: {
        customerId_productId: {
          customerId,
          productId,
        },
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.favorite.create({
      data: {
        customerId,
        productId,
      },
    });
  }

  async removeFavorite(customerId: string, productId: string) {
    try {
      await this.prisma.favorite.delete({
        where: {
          customerId_productId: {
            customerId,
            productId,
          },
        },
      });
      return { success: true };
    } catch (error) {
      return { success: true };
    }
  }

  // ========== ADDRESSES ==========

  async getAddresses(customerId: string) {
    return this.prisma.customerAddress.findMany({
      where: { customerId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async addAddress(customerId: string, data: any) {
    // If it's the first address or marked as default, unset other defaults
    if (data.isDefault) {
      await this.prisma.customerAddress.updateMany({
        where: { customerId },
        data: { isDefault: false },
      });
    } else {
      // Check if user has any addresses, if not, make this default
      const count = await this.prisma.customerAddress.count({
        where: { customerId },
      });
      if (count === 0) data.isDefault = true;
    }

    return this.prisma.customerAddress.create({
      data: {
        ...data,
        customerId,
      },
    });
  }

  async updateAddress(customerId: string, addressId: string, data: any) {
    // Verify ownership
    const address = await this.prisma.customerAddress.findFirst({
      where: { id: addressId, customerId },
    });

    if (!address) throw new NotFoundException('Adres bulunamadı');

    if (data.isDefault) {
      await this.prisma.customerAddress.updateMany({
        where: { customerId, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    return this.prisma.customerAddress.update({
      where: { id: addressId },
      data,
    });
  }

  async deleteAddress(customerId: string, addressId: string) {
    const address = await this.prisma.customerAddress.findFirst({
      where: { id: addressId, customerId },
    });

    if (!address) throw new NotFoundException('Adres bulunamadı');

    await this.prisma.customerAddress.delete({
      where: { id: addressId },
    });

    // If we deleted the default address, make the most recently created one default
    if (address.isDefault) {
      const nextAddress = await this.prisma.customerAddress.findFirst({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
      });

      if (nextAddress) {
        await this.prisma.customerAddress.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }
    }

    return { success: true };
  }

  async setDefaultAddress(customerId: string, addressId: string) {
    const address = await this.prisma.customerAddress.findFirst({
      where: { id: addressId, customerId },
    });

    if (!address) throw new NotFoundException('Adres bulunamadı');

    await this.prisma.customerAddress.updateMany({
      where: { customerId },
      data: { isDefault: false },
    });

    return this.prisma.customerAddress.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  }

  // ========== CART & CHECKOUT ==========

  /**
   * Sepet hesaplama
   */
  async calculateCart(items: CartItemDto[], couponCode?: string) {
    let subtotal = 0;
    const cartItems: any[] = [];
    const campaigns = await this.campaignsService.getActiveCampaigns();

    for (const item of items) {
      const variant = await this.prisma.variant.findUnique({
        where: { id: item.variantId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
              basePrice: true,
              salePrice: true,
              categoryId: true,
            },
          },
        },
      });

      if (!variant) {
        throw new BadRequestException(`Ürün bulunamadı: ${item.variantId}`);
      }

      if (variant.stock < item.quantity) {
        throw new BadRequestException(
          `Yetersiz stok: ${variant.product.name} (${variant.size}/${variant.color})`,
        );
      }

      const basePrice = Number(variant.price || variant.product.basePrice);
      let price = Number(
        variant.price || variant.product.salePrice || variant.product.basePrice,
      );

      // Aktif kampanyaları al ve uygula
      const applicableCampaign = campaigns.find(
        (c) =>
          (c.productIds as string[])?.includes(variant.product.id) ||
          (c.categoryIds as string[])?.includes(
            (variant.product as any).categoryId,
          ),
      );

      if (applicableCampaign) {
        let campaignDiscount = 0;
        if (applicableCampaign.discountType === 'PERCENTAGE') {
          campaignDiscount =
            basePrice * (Number(applicableCampaign.discountValue) / 100);
        } else {
          campaignDiscount = Number(applicableCampaign.discountValue);
        }
        const campaignPrice = basePrice - campaignDiscount;
        if (campaignPrice < price) {
          price = campaignPrice;
        }
      }

      const itemTotal = Number(price) * item.quantity;
      subtotal += itemTotal;

      cartItems.push({
        variantId: variant.id,
        product: variant.product,
        variant: { size: variant.size, color: variant.color },
        quantity: item.quantity,
        unitPrice: price,
        total: itemTotal,
      });
    }

    // Kupon indirimi
    let discount = 0;
    let couponInfo: any = null;

    if (couponCode) {
      try {
        const validation = await this.campaignsService.validateCoupon({
          code: couponCode,
          cartTotal: subtotal,
        });
        discount = validation.discount;
        couponInfo = validation.coupon;
      } catch (error) {
        // Kupon geçersiz, devam et
      }
    }

    const shippingCost = subtotal >= 500 ? 0 : 29.99; // 500 TL üzeri ücretsiz kargo
    const total = subtotal - discount + shippingCost;

    return {
      items: cartItems,
      subtotal,
      discount,
      coupon: couponInfo,
      shippingCost,
      total,
      freeShippingThreshold: 500,
      remainingForFreeShipping: Math.max(0, 500 - subtotal),
    };
  }

  /**
   * Checkout (sipariş oluştur)
   */
  async checkout(checkoutDto: CheckoutDto, customerId?: string) {
    // Sepeti hesapla
    const cart = await this.calculateCart(
      checkoutDto.items,
      checkoutDto.couponCode,
    );
    const variantQuantities = this.getCartVariantQuantities(checkoutDto.items);

    // Sipariş numarası
    const order = await this.prisma.$transaction(async (tx) => {
      const orderNumber = await this.generateUniqueOrderNumber(tx);

      // Müşteri bul veya oluştur
      let customer;

      if (customerId) {
        customer = await tx.customer.findUnique({
          where: { id: customerId },
        });
      }

      if (!customer) {
        customer = await tx.customer.findFirst({
          where: { phone: checkoutDto.shippingAddress.phone },
        });
      }

      if (!customer) {
        const [firstName, ...lastNameParts] =
          checkoutDto.shippingAddress.fullName.split(' ');
        customer = await tx.customer.create({
          data: {
            firstName,
            lastName: lastNameParts.join(' ') || '',
            phone: checkoutDto.shippingAddress.phone,
            email: checkoutDto.shippingAddress.email,
            address: checkoutDto.shippingAddress.address,
            city: checkoutDto.shippingAddress.city,
            district: checkoutDto.shippingAddress.district,
          },
        });
      }

      // Sipariş oluştur
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          subtotal: cart.subtotal,
          discountAmount: cart.discount,
          shippingCost: cart.shippingCost,
          totalAmount: cart.total,
          couponCode: checkoutDto.couponCode,
          shippingAddress: checkoutDto.shippingAddress as any,
          notes: checkoutDto.notes,
          source: OrderSource.ONLINE,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          payments: {
            create: {
              amount: cart.total,
              method: checkoutDto.paymentMethod,
              status: PaymentStatus.PENDING,
            },
          },
          items: {
            create: cart.items.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
            })),
          },
        },
        include: {
          items: true,
          customer: {
            select: { firstName: true, lastName: true, phone: true },
          },
        },
      });

      // Stokları düşür
      for (const [variantId, quantity] of variantQuantities.entries()) {
        const stockUpdate = await tx.variant.updateMany({
          where: { id: variantId, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } },
        });

        if (stockUpdate.count !== 1) {
          throw new BadRequestException(
            `Yetersiz stok veya urun bulunamadi: ${variantId}`,
          );
        }
      }

      // Kupon kullanıldı olarak işaretle
      if (checkoutDto.couponCode) {
        await this.campaignsService.useCoupon(checkoutDto.couponCode, tx);
      }

      return order;
    });

    this.logger.log(`Yeni online sipariş: ${order.orderNumber}`);

    // Send order confirmation email
    try {
      const shippingAddr = checkoutDto.shippingAddress;
      if (shippingAddr.email) {
        await this.emailService.sendOrderConfirmation(shippingAddr.email, {
          orderNumber: order.orderNumber,
          customerName: shippingAddr.fullName,
          items: cart.items.map((item) => ({
            name: item.product.name,
            quantity: item.quantity,
            price: Number(item.total),
          })),
          totalAmount: Number(cart.total),
          shippingAddress: `${shippingAddr.address}, ${shippingAddr.district}/${shippingAddr.city}`,
        });
      }
    } catch (emailError: any) {
      this.logger.warn(`Email gönderilemedi: ${emailError.message}`);
    }

    return {
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
      },
      message: 'Siparişiniz başarıyla oluşturuldu',
    };
  }

  /**
   * Müşteri siparişlerini getir
   */
  async getCustomerOrders(customerId: string) {
    const orders = await this.prisma.order.findMany({
      where: { customerId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: { select: { name: true, images: true } },
              },
            },
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const returnSummaries = await this.returnsService.getOrderReturnSummaries(
      orders.map((order) => order.id),
    );

    return orders.map((order) => ({
      ...order,
      returnInfo: returnSummaries.get(order.id),
    }));
  }

  /**
   * Sipariş takibi
   */
  async trackOrder(orderNumber: string, phone: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        orderNumber,
        customer: { phone },
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: { select: { name: true, images: true } },
              },
            },
          },
        },
        returns: {
          where: { status: { not: 'REJECTED' } },
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Sipariş bulunamadı');
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      returnInfo: await this.returnsService.getOrderReturnSummary(order.id),
      items: order.items.map((item) => ({
        product: item.variant.product.name,
        variantId: item.variantId,
        image: (item.variant.product.images as any)?.[0],
        size: item.variant.size,
        color: item.variant.color,
        quantity: item.quantity,
        price: item.total,
      })),
    };
  }

  async createReturn(
    customerId: string,
    orderId: string,
    body: CreateCustomerReturnDto,
  ): Promise<HydratedReturn> {
    return this.returnsService.createCustomerReturn(customerId, orderId, body);
  }

  async getOrderInvoice(customerId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        customerId,
        OR: [{ id: orderId }, { orderNumber: orderId }],
      },
      include: { invoice: true },
    });

    if (!order) throw new NotFoundException('Sipariş bulunamadı');

    const invoice =
      order.invoice ||
      (await this.invoicesService.create({ orderId: order.id }));
    const pdfPath = await this.invoicesService.getPdfPath(invoice.id);
    const updatedInvoice = await this.prisma.invoice.findUnique({
      where: { id: invoice.id },
    });
    const pdfFileName = pdfPath.replace(/\\/g, '/').split('/').pop();
    const pdfUrl =
      updatedInvoice?.pdfUrl ||
      invoice.pdfUrl ||
      (pdfFileName ? `/uploads/invoices/${pdfFileName}` : null);

    return {
      success: Boolean(pdfUrl),
      url: pdfUrl,
      message: updatedInvoice?.pdfUrl
        ? undefined
        : 'Fatura PDF dosyası oluşturulamadı.',
    };

    /*
        if (!updatedInvoice?.pdfUrl) {
            return {
                success: false,
                url: null,
                message: 'Faturanız henüz sistemde PDF olarak oluşturulmamış. Lütfen daha sonra tekrar deneyin.'
            };
        }

    }
        */
  }

  private getCartVariantQuantities(items: CartItemDto[]): Map<string, number> {
    const quantities = new Map<string, number>();
    for (const item of items) {
      quantities.set(
        item.variantId,
        (quantities.get(item.variantId) || 0) + item.quantity,
      );
    }

    return quantities;
  }

  private async generateUniqueOrderNumber(
    client: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<string> {
    let orderNumber: string;
    let exists = true;

    while (exists) {
      orderNumber = generateOrderNumber();
      const existing = await client.order.findUnique({
        where: { orderNumber },
      });
      exists = !!existing;
    }

    return orderNumber!;
  }
}
