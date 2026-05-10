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
    GoogleLoginDto
} from './dto';
import { CampaignsService } from '../campaigns/campaigns.service';
import { EmailService } from '../email/email.service';
import { getPaginationParams, createPaginatedResult, generateOrderNumber } from '../../common/utils';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class StorefrontService {
    private readonly logger = new Logger(StorefrontService.name);

    constructor(
        private prisma: PrismaService,
        private campaignsService: CampaignsService,
        private emailService: EmailService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

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
            throw new BadRequestException('Google profilinden geçerli bir e-posta adresi alınamadı.');
        }

        const email = payload.email;
        const googleId = payload.sub;
        const firstName = payload.given_name || 'Google';
        const lastName = payload.family_name || 'Kullanıcısı';

        // Find customer by Google ID or by Email
        let customer = await this.prisma.customer.findFirst({
            where: {
                OR: [
                    { googleId },
                    { email }
                ]
            }
        });

        if (customer) {
            // If they match by email but didn't have googleId linked, update it
            if (!customer.googleId) {
                customer = await this.prisma.customer.update({
                    where: { id: customer.id },
                    data: { googleId }
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
                }
            });
        }

        if (!customer.isActive) {
            throw new UnauthorizedException('Bu hesap aktif değil.');
        }

        const jwtPayload = { sub: customer.id, email: customer.email, type: 'CUSTOMER' };
        const accessToken = this.jwtService.sign(jwtPayload);

        return {
            accessToken,
            user: {
                id: customer.id,
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone
            }
        };
    }

    async loginCustomer(dto: CustomerLoginDto) {
        const customer = await this.prisma.customer.findFirst({
            where: { email: dto.email }
        });

        if (!customer || !customer.isActive) {
            throw new UnauthorizedException('Giriş başarısız. Bilgilerinizi kontrol edin.');
        }

        if (!customer.password) {
            throw new UnauthorizedException('Bu hesap için şifre tanımlanmamış. Lütfen şifremi unuttum adımını kullanın veya yeni kayıt olun.');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, customer.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Giriş başarısız. Bilgilerinizi kontrol edin.');
        }

        const payload = { sub: customer.id, email: customer.email, type: 'CUSTOMER' };
        const accessToken = this.jwtService.sign(payload);

        return {
            accessToken,
            user: {
                id: customer.id,
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone
            }
        };
    }

    async registerCustomer(dto: CustomerRegisterDto) {
        const existingCustomer = await this.prisma.customer.findFirst({
            where: { email: dto.email }
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
            }
        });

        return {
            success: true,
            message: 'Kayıt başarılı. Şimdi giriş yapabilirsiniz.'
        };
    }

    // ========== HOME / SETTINGS ==========

    async getBanners(position?: string) {
        // Bu endpoint için yeni bir Banner tablosu veya Marketing tablosu kullanılabilir.
        // Mevcut mimaride Marketing tablosu olduğunu varsayalım veya simüle edelim.
        // Şimdilik Kampanyaları banner olarak döndürebiliriz.
        const campaigns = await this.campaignsService.getActiveCampaigns();
        return campaigns.map(c => ({
            id: c.id,
            title: c.name,
            subtitle: c.description,
            image: (c as any).imageUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000',
            link: `/koleksiyonlar/${(c as any).slug || c.id}`,
            position: position || 'hero'
        }));
    }

    async getAttributes() {
        // Tüm varyantlardan benzersiz beden ve renkleri çek
        const variants = await this.prisma.variant.findMany({
            where: { stock: { gt: 0 } },
            select: { size: true, color: true },
        });

        const sizes = Array.from(new Set(variants.map(v => v.size))).filter(Boolean).sort();
        const colors = Array.from(new Set(variants.map(v => v.color))).filter(Boolean).sort();

        return {
            sizes,
            colors: colors.map(c => ({ name: c, value: c }))
        };
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
        // Kampanyaları koleksiyon olarak kullanıyoruz
        const campaigns = await this.campaignsService.findAllCampaigns();
        const campaign = campaigns.find((c: any) => c.slug === slug || c.id === slug);

        if (!campaign) {
            throw new NotFoundException('Koleksiyon bulunamadı');
        }

        return {
            id: campaign.id,
            title: campaign.name,
            subtitle: campaign.description,
            description: campaign.description,
            coverImage: (campaign as any).imageUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000',
            accentColor: 'bg-amber-500',
            categorySlug: 'giyim' // Default
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
                    stock: { gt: 0 }
                }
            };
            if (query.sizes) {
                where.variants.some.size = { in: query.sizes.split(',') };
            }
            if (query.colors) {
                where.variants.some.color = { in: query.colors.split(',') };
            }
        }

        // Sıralama
        let orderBy: any = { createdAt: 'desc' };
        if (query.sort) {
            switch (query.sort) {
                case 'price_asc':
                    orderBy = { basePrice: 'asc' };
                    break;
                case 'price_desc':
                    orderBy = { basePrice: 'desc' };
                    break;
                case 'newest':
                    orderBy = { createdAt: 'desc' };
                    break;
                case 'popular':
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
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    basePrice: true,
                    salePrice: true,
                    images: true,
                    category: { select: { name: true, slug: true } },
                    variants: {
                        where: { stock: { gt: 0 } },
                        select: { id: true, size: true, color: true, stock: true },
                        take: 5,
                    },
                    _count: { select: { variants: true } },
                },
            }),
            this.prisma.product.count({ where }),
        ]);

        // Aktif kampanyaları uygula
        const campaigns = await this.campaignsService.getActiveCampaigns();
        const productsWithDiscounts = products.map((product) => {
            const applicableCampaign = campaigns.find((c) =>
                (c.productIds as string[])?.includes(product.id) ||
                (c.categoryIds as string[])?.includes(product.category?.name || '')
            );

            return {
                ...product,
                campaign: applicableCampaign ? {
                    name: applicableCampaign.name,
                    discountType: applicableCampaign.discountType,
                    discountValue: applicableCampaign.discountValue,
                } : null,
            };
        });

        return createPaginatedResult(productsWithDiscounts, total, page, limit);
    }

    /**
     * Ürün detayı (slug ile)
     */
    async getProductBySlug(slug: string) {
        const product = await this.prisma.product.findUnique({
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
            },
        });

        return {
            ...product,
            relatedProducts,
        };
    }

    // ========== CART & CHECKOUT ==========

    /**
     * Sepet hesaplama
     */
    async calculateCart(items: CartItemDto[], couponCode?: string) {
        let subtotal = 0;
        const cartItems: any[] = [];

        for (const item of items) {
            const variant = await this.prisma.variant.findUnique({
                where: { id: item.variantId },
                include: {
                    product: {
                        select: { id: true, name: true, slug: true, images: true, basePrice: true, salePrice: true },
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

            const price = variant.price || variant.product.salePrice || variant.product.basePrice;
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
    async checkout(checkoutDto: CheckoutDto) {
        // Sepeti hesapla
        const cart = await this.calculateCart(checkoutDto.items, checkoutDto.couponCode);

        // Sipariş numarası
        const orderNumber = await this.generateUniqueOrderNumber();

        // Müşteri oluştur veya bul
        let customer = await this.prisma.customer.findFirst({
            where: { phone: checkoutDto.shippingAddress.phone },
        });

        if (!customer) {
            const [firstName, ...lastNameParts] = checkoutDto.shippingAddress.fullName.split(' ');
            customer = await this.prisma.customer.create({
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
        const order = await this.prisma.order.create({
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
                status: OrderStatus.PENDING,
                paymentStatus: PaymentStatus.PENDING,
                payments: {
                    create: {
                        amount: cart.total,
                        method: checkoutDto.paymentMethod,
                        status: PaymentStatus.PENDING,
                    }
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
                customer: { select: { firstName: true, lastName: true, phone: true } },
            },
        });

        // Stokları düşür
        for (const item of checkoutDto.items) {
            await this.prisma.variant.update({
                where: { id: item.variantId },
                data: { stock: { decrement: item.quantity } },
            });
        }

        // Kupon kullanıldı olarak işaretle
        if (checkoutDto.couponCode) {
            await this.campaignsService.useCoupon(checkoutDto.couponCode);
        }

        this.logger.log(`Yeni online sipariş: ${order.orderNumber}`);

        // Send order confirmation email
        try {
            const shippingAddr = checkoutDto.shippingAddress;
            if (shippingAddr.email) {
                await this.emailService.sendOrderConfirmation(
                    shippingAddr.email,
                    {
                        orderNumber: order.orderNumber,
                        customerName: shippingAddr.fullName,
                        items: cart.items.map(item => ({
                            name: item.product.name,
                            quantity: item.quantity,
                            price: Number(item.total)
                        })),
                        totalAmount: Number(cart.total),
                        shippingAddress: `${shippingAddr.address}, ${shippingAddr.district}/${shippingAddr.city}`
                    }
                );
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
            },
        });

        if (!order) {
            throw new NotFoundException('Sipariş bulunamadı');
        }

        return {
            orderNumber: order.orderNumber,
            status: order.status,
            paymentStatus: order.paymentStatus,
            totalAmount: order.totalAmount,
            createdAt: order.createdAt,
            items: order.items.map((item) => ({
                product: item.variant.product.name,
                image: (item.variant.product.images as any)?.[0],
                size: item.variant.size,
                color: item.variant.color,
                quantity: item.quantity,
                price: item.total,
            })),
        };
    }

    private async generateUniqueOrderNumber(): Promise<string> {
        let orderNumber: string;
        let exists = true;

        while (exists) {
            orderNumber = generateOrderNumber();
            const existing = await this.prisma.order.findUnique({
                where: { orderNumber },
            });
            exists = !!existing;
        }

        return orderNumber!;
    }
}
