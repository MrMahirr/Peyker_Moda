import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
    CreateCampaignDto,
    UpdateCampaignDto,
    CreateCouponDto,
    UpdateCouponDto,
    ValidateCouponDto,
} from './dto';
import { DiscountType } from '@prisma/client';

@Injectable()
export class CampaignsService {
    private readonly logger = new Logger(CampaignsService.name);

    constructor(private prisma: PrismaService) { }

    // ========== CAMPAIGNS ==========

    /**
     * Kampanya listesi
     */
    async findAllCampaigns(includeInactive = false) {
        const where = includeInactive ? {} : { isActive: true };

        return this.prisma.campaign.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Aktif kampanyalar
     */
    async getActiveCampaigns() {
        const now = new Date();

        return this.prisma.campaign.findMany({
            where: {
                isActive: true,
                startDate: { lte: now },
                endDate: { gte: now },
            },
            orderBy: { discountValue: 'desc' },
        });
    }

    /**
     * Kampanya detayı
     */
    async findOneCampaign(id: string) {
        const campaign = await this.prisma.campaign.findUnique({
            where: { id },
        });

        if (!campaign) {
            throw new NotFoundException('Kampanya bulunamadı');
        }

        return campaign;
    }

    /**
     * Yeni kampanya oluştur
     */
    async createCampaign(createCampaignDto: CreateCampaignDto) {
        const campaign = await this.prisma.campaign.create({
            data: {
                ...createCampaignDto,
                startDate: new Date(createCampaignDto.startDate),
                endDate: new Date(createCampaignDto.endDate),
                categoryIds: createCampaignDto.categoryIds || [],
                productIds: createCampaignDto.productIds || [],
            },
        });

        this.logger.log(`Yeni kampanya: ${campaign.name}`);

        return campaign;
    }

    /**
     * Kampanya güncelle
     */
    async updateCampaign(id: string, updateCampaignDto: UpdateCampaignDto) {
        await this.findOneCampaign(id);

        const data: any = { ...updateCampaignDto };
        if (updateCampaignDto.startDate) {
            data.startDate = new Date(updateCampaignDto.startDate);
        }
        if (updateCampaignDto.endDate) {
            data.endDate = new Date(updateCampaignDto.endDate);
        }

        const campaign = await this.prisma.campaign.update({
            where: { id },
            data,
        });

        this.logger.log(`Kampanya güncellendi: ${campaign.name}`);

        return campaign;
    }

    /**
     * Kampanya sil
     */
    async removeCampaign(id: string) {
        const campaign = await this.findOneCampaign(id);

        await this.prisma.campaign.delete({
            where: { id },
        });

        this.logger.log(`Kampanya silindi: ${campaign.name}`);

        return { message: 'Kampanya silindi' };
    }

    // ========== COUPONS ==========

    /**
     * Kupon listesi
     */
    async findAllCoupons(includeInactive = false) {
        const where = includeInactive ? {} : { isActive: true };

        return this.prisma.coupon.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Kupon detayı
     */
    async findOneCoupon(id: string) {
        const coupon = await this.prisma.coupon.findUnique({
            where: { id },
        });

        if (!coupon) {
            throw new NotFoundException('Kupon bulunamadı');
        }

        return coupon;
    }

    /**
     * Kupon kodu ile ara
     */
    async findCouponByCode(code: string) {
        const coupon = await this.prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (!coupon) {
            throw new NotFoundException('Kupon bulunamadı');
        }

        return coupon;
    }

    /**
     * Yeni kupon oluştur
     */
    async createCoupon(createCouponDto: CreateCouponDto) {
        // Kod benzersiz mi kontrol et
        const existing = await this.prisma.coupon.findUnique({
            where: { code: createCouponDto.code.toUpperCase() },
        });

        if (existing) {
            throw new ConflictException('Bu kupon kodu zaten kullanılıyor');
        }

        const coupon = await this.prisma.coupon.create({
            data: {
                ...createCouponDto,
                code: createCouponDto.code.toUpperCase(),
                startDate: new Date(createCouponDto.startDate),
                endDate: new Date(createCouponDto.endDate),
            },
        });

        this.logger.log(`Yeni kupon: ${coupon.code}`);

        return coupon;
    }

    /**
     * Kupon güncelle
     */
    async updateCoupon(id: string, updateCouponDto: UpdateCouponDto) {
        await this.findOneCoupon(id);

        const data: any = { ...updateCouponDto };
        if (updateCouponDto.endDate) {
            data.endDate = new Date(updateCouponDto.endDate);
        }

        const coupon = await this.prisma.coupon.update({
            where: { id },
            data,
        });

        this.logger.log(`Kupon güncellendi: ${coupon.code}`);

        return coupon;
    }

    /**
     * Kupon sil
     */
    async removeCoupon(id: string) {
        const coupon = await this.findOneCoupon(id);

        await this.prisma.coupon.delete({
            where: { id },
        });

        this.logger.log(`Kupon silindi: ${coupon.code}`);

        return { message: 'Kupon silindi' };
    }

    /**
     * Kupon doğrula
     */
    async validateCoupon(validateDto: ValidateCouponDto) {
        const coupon = await this.findCouponByCode(validateDto.code);
        const now = new Date();

        // Aktif mi kontrol et
        if (!coupon.isActive) {
            throw new BadRequestException('Bu kupon aktif değil');
        }

        // Tarih kontrolü
        if (now < coupon.startDate || now > coupon.endDate) {
            throw new BadRequestException('Bu kupon geçerli değil');
        }

        // Kullanım limiti kontrolü
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            throw new BadRequestException('Bu kupon kullanım limitine ulaştı');
        }

        // Minimum sepet tutarı kontrolü
        if (coupon.minPurchase && validateDto.cartTotal < Number(coupon.minPurchase)) {
            throw new BadRequestException(
                `Bu kupon için minimum sepet tutarı ${coupon.minPurchase} TL`,
            );
        }

        // Müşteri bazlı kullanım kontrolü
        if (validateDto.customerId && coupon.usageLimitPerCustomer) {
            const customerUsage = await this.prisma.order.count({
                where: {
                    customerId: validateDto.customerId,
                    couponCode: coupon.code,
                },
            });

            if (customerUsage >= coupon.usageLimitPerCustomer) {
                throw new BadRequestException('Bu kuponu daha fazla kullanamazsınız');
            }
        }

        // İndirim hesapla
        let discount = 0;
        if (coupon.discountType === DiscountType.PERCENTAGE) {
            discount = (validateDto.cartTotal * Number(coupon.discountValue)) / 100;
        } else {
            discount = Number(coupon.discountValue);
        }

        // Maksimum indirim kontrolü
        if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
            discount = Number(coupon.maxDiscount);
        }

        return {
            valid: true,
            coupon: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
            },
            discount,
            finalTotal: validateDto.cartTotal - discount,
        };
    }

    /**
     * Kupon kullan
     */
    async useCoupon(code: string) {
        const coupon = await this.findCouponByCode(code);

        await this.prisma.coupon.update({
            where: { id: coupon.id },
            data: { usageCount: { increment: 1 } },
        });

        this.logger.log(`Kupon kullanıldı: ${code}`);

        return { message: 'Kupon kullanıldı' };
    }
}
