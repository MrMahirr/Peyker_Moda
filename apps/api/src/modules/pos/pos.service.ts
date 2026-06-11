import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PosSaleDto,
  HoldSaleDto,
  OpenSessionDto,
  CloseSessionDto,
} from './dto';
import { generateOrderNumber } from '../../common/utils';
import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  OrderSource,
} from '@prisma/client';

@Injectable()
export class PosService {
  private readonly logger = new Logger(PosService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * POS ürünlerini getirir
   */
  async getProducts(search?: string, categoryId?: string) {
    const where: any = {
      isActive: true,
    };

    if (categoryId) {
      where.product = { categoryId };
    }

    if (search) {
      where.OR = [
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } },
        { product: { sku: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const variants = await this.prisma.variant.findMany({
      where,
      include: {
        product: { include: { category: true } },
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    return variants.map((v) => {
      const hasOptions = v.size || v.color;
      const optionsStr = hasOptions
        ? ` (${[v.size, v.color].filter(Boolean).join(' / ')})`
        : '';
      // images form handling
      let imageUrl: string | undefined = undefined;
      if (v.product.images) {
        const imgs = v.product.images as string[];
        if (Array.isArray(imgs) && imgs.length > 0) {
          imageUrl = imgs[0];
        }
      }

      return {
        id: v.id,
        name: `${v.product.name}${optionsStr}`,
        sku: v.sku,
        barcode: v.barcode,
        price: Number(v.price ?? v.product.basePrice ?? 0),
        stock: v.stock,
        image: imageUrl,
        categoryName: v.product.category?.name || 'Diğer',
      };
    });
  }

  /**
   * Barkoda göre POS ürünü getir
   */
  async getProductByBarcode(barcode: string) {
    const variant = await this.prisma.variant.findFirst({
      where: {
        OR: [{ barcode }, { product: { barcode } }],
        isActive: true,
      },
      include: {
        product: { include: { category: true } },
      },
    });

    if (!variant) {
      throw new NotFoundException('Ürün bulunamadı veya pasif');
    }

    const hasOptions = variant.size || variant.color;
    const optionsStr = hasOptions
      ? ` (${[variant.size, variant.color].filter(Boolean).join(' / ')})`
      : '';

    // images form handling
    let imageUrl: string | undefined = undefined;
    if (variant.product.images) {
      const imgs = variant.product.images as string[];
      if (Array.isArray(imgs) && imgs.length > 0) {
        imageUrl = imgs[0];
      }
    }

    return {
      id: variant.id,
      name: `${variant.product.name}${optionsStr}`,
      sku: variant.sku,
      barcode: variant.barcode,
      price: Number(variant.price ?? variant.product.basePrice ?? 0),
      stock: variant.stock,
      image: imageUrl,
      categoryName: variant.product.category?.name || 'Diğer',
    };
  }

  /**
   * POS Satış işlemi
   */
  async processSale(saleDto: PosSaleDto, userId: string) {
    // Stok kontrolü ve toplam hesaplama
    let subtotal = 0;
    const orderItems: any[] = [];

    for (const item of saleDto.items) {
      const variant = await this.prisma.variant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      });

      if (!variant) {
        throw new BadRequestException(`Ürün bulunamadı: ${item.variantId}`);
      }

      if (variant.stock < item.quantity) {
        throw new BadRequestException(
          `Yetersiz stok: ${variant.product.name} (${variant.size}/${variant.color})`,
        );
      }

      const itemTotal = item.price * item.quantity - (item.discount || 0);
      subtotal += itemTotal;

      orderItems.push({
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: item.price,
        discount: item.discount || 0,
        total: itemTotal,
      });
    }

    // İndirim ve toplam
    const discountAmount = saleDto.discountAmount || 0;
    const totalAmount = subtotal - discountAmount;

    // Ödeme kontrolü
    const totalPayment = saleDto.payments.reduce((sum, p) => sum + p.amount, 0);
    if (totalPayment < totalAmount) {
      throw new BadRequestException(
        `Yetersiz ödeme. Toplam: ${totalAmount.toFixed(2)} TL, Ödenen: ${totalPayment.toFixed(2)} TL`,
      );
    }

    // Sipariş numarası
    const orderNumber = await this.generateUniqueOrderNumber();

    // Sipariş ve ödemeleri oluştur
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        customerId: saleDto.customerId,
        userId,
        subtotal,
        discountAmount,
        totalAmount,
        paidAmount: totalPayment,
        notes: saleDto.notes,
        source: OrderSource.POS,
        status: OrderStatus.COMPLETED,
        paymentStatus: PaymentStatus.COMPLETED,
        items: {
          create: orderItems,
        },
        payments: {
          create: saleDto.payments.map((p) => ({
            method: p.method,
            amount: p.amount,
            status: PaymentStatus.COMPLETED,
          })),
        },
      },
      include: {
        items: { include: { variant: { include: { product: true } } } },
        payments: true,
        customer: { select: { firstName: true, lastName: true } },
      },
    });

    // Stokları düşür
    for (const item of saleDto.items) {
      await this.prisma.variant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Para üstü hesapla
    const change = totalPayment - totalAmount;

    this.logger.log(
      `POS Satış: ${order.orderNumber} - ${totalAmount.toFixed(2)} TL`,
    );

    return {
      order,
      change,
      receipt: {
        orderNumber: order.orderNumber,
        items: order.items,
        subtotal,
        discount: discountAmount,
        total: totalAmount,
        payments: order.payments,
        change,
        date: order.createdAt,
      },
    };
  }

  /**
   * Satışı beklet
   */
  async holdSale(holdDto: HoldSaleDto, userId: string) {
    const hold = await this.prisma.heldSale.create({
      data: {
        userId,
        customerId: holdDto.customerId,
        notes: holdDto.notes,
        items: holdDto.items as any, // JSON olarak sakla
      },
    });

    this.logger.log(`Satış bekletildi: ${hold.id}`);

    return hold;
  }

  /**
   * Bekleyen satışları getir
   */
  async getHeldSales(userId?: string) {
    const where = userId ? { userId } : {};

    const heldSales = await this.prisma.heldSale.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true } },
        customer: { select: { firstName: true, lastName: true } },
      },
    });

    return heldSales;
  }

  /**
   * Bekleyen satışı getir
   */
  async getHeldSale(id: string) {
    const heldSale = await this.prisma.heldSale.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
      },
    });

    if (!heldSale) {
      throw new NotFoundException('Bekleyen satış bulunamadı');
    }

    return heldSale;
  }

  /**
   * Bekleyen satışı iptal et
   */
  async cancelHeldSale(id: string) {
    await this.getHeldSale(id);

    await this.prisma.heldSale.delete({
      where: { id },
    });

    return { message: 'Bekleyen satış silindi' };
  }

  /**
   * Kasa oturumu (aktif)
   */
  async getCurrentSession(userId: string) {
    return this.prisma.posSession.findFirst({
      where: { userId, closedAt: null },
      orderBy: { openedAt: 'desc' },
    });
  }

  /**
   * Kasa oturumunu kapat (aktif oturum)
   */
  async closeCurrentSession(closeDto: CloseSessionDto, userId: string) {
    const session = await this.prisma.posSession.findFirst({
      where: { userId, closedAt: null },
      orderBy: { openedAt: 'desc' },
    });

    if (!session) {
      throw new NotFoundException('Açık oturum bulunamadı');
    }

    return this.closeSession(session.id, closeDto, userId);
  }

  async openSession(openDto: OpenSessionDto, userId: string) {
    // Açık oturum var mı kontrol et
    const existingSession = await this.prisma.posSession.findFirst({
      where: { userId, closedAt: null },
    });

    if (existingSession) {
      throw new BadRequestException('Zaten açık bir oturumunuz var');
    }

    const session = await this.prisma.posSession.create({
      data: {
        userId,
        openingBalance: openDto.openingBalance,
        notes: openDto.notes,
      },
    });

    this.logger.log(`Kasa oturumu açıldı: ${session.id}`);

    return session;
  }

  /**
   * Kasa oturumu kapat
   */
  async closeSession(id: string, closeDto: CloseSessionDto, userId: string) {
    const session = await this.prisma.posSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Oturum bulunamadı');
    }

    if (session.closedAt) {
      throw new BadRequestException('Oturum zaten kapatılmış');
    }

    if (session.userId !== userId) {
      throw new BadRequestException('Bu oturumu sadece açan kişi kapatabilir');
    }

    // Oturum süresince yapılan satışları hesapla
    const salesSummary = await this.prisma.payment.aggregate({
      where: {
        createdAt: { gte: session.openedAt },
        order: { userId },
      },
      _sum: { amount: true },
      _count: true,
    });

    const totalSales = salesSummary._sum.amount || 0;
    const expectedBalance = Number(session.openingBalance) + Number(totalSales);
    const difference = closeDto.closingBalance - expectedBalance;

    const closedSession = await this.prisma.posSession.update({
      where: { id },
      data: {
        closedAt: new Date(),
        closingBalance: closeDto.closingBalance,
        expectedBalance,
        difference,
        totalSales,
        totalTransactions: salesSummary._count,
        notes: closeDto.notes,
      },
    });

    this.logger.log(`Kasa oturumu kapatıldı: ${session.id}`);

    return closedSession;
  }

  /**
   * Oturum raporu
   */
  async getSessionReport(id: string) {
    const session = await this.prisma.posSession.findUnique({
      where: { id },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });

    if (!session) {
      throw new NotFoundException('Oturum bulunamadı');
    }

    // Ödeme yöntemine göre dağılım
    const paymentsByMethod = await this.prisma.payment.groupBy({
      by: ['method'],
      where: {
        createdAt: {
          gte: session.openedAt,
          ...(session.closedAt && { lte: session.closedAt }),
        },
        order: { userId: session.userId },
      },
      _sum: { amount: true },
      _count: true,
    });

    return {
      session,
      paymentsByMethod: paymentsByMethod.map((p) => ({
        method: p.method,
        total: p._sum.amount || 0,
        count: p._count,
      })),
    };
  }

  /**
   * Benzersiz sipariş numarası
   */
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
