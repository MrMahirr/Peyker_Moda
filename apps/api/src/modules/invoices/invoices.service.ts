import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvoiceDto } from './dto';
import { InvoiceStatus } from '@prisma/client';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createInvoiceDto: CreateInvoiceDto) {
    const {
      orderId,
      items,
      customerName,
      invoiceNumber,
      total,
      tax,
      status,
      taxId,
      taxOffice,
    } = createInvoiceDto;

    if (orderId) {
      // SIPARİŞ ÜZERİNDEN FATURA
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: { include: { variant: { include: { product: true } } } },
          customer: true,
          user: true,
          invoice: true,
        },
      });

      if (!order) {
        throw new NotFoundException('Sipariş bulunamadı');
      }

      if (order.invoice) {
        throw new BadRequestException(
          'Bu sipariş için zaten fatura oluşturulmuş',
        );
      }

      const invoiceNo = invoiceNumber || `INV-${Date.now()}`;
      const totalAmount = Number(order.totalAmount);
      const taxRate = 20;
      const taxBase = totalAmount / (1 + taxRate / 100);
      const taxAmount = totalAmount - taxBase;

      const invoice = await this.prisma.invoice.create({
        data: {
          invoiceNo,
          orderId,
          customerName: order.customer
            ? `${order.customer.firstName} ${order.customer.lastName}`
            : 'Misafir Müşteri',
          taxId: taxId || createInvoiceDto.taxId,
          taxOffice: taxOffice || createInvoiceDto.taxOffice,
          amount: totalAmount,
          taxRate,
          taxAmount: Number(taxAmount.toFixed(2)),
          status: (status as InvoiceStatus) || 'DRAFT',
        },
      });

      this.generatePdf(invoice.id).catch((err) =>
        this.logger.error('PDF generation failed', err),
      );

      return invoice;
    } else {
      // MANUEL FATURA
      if (!items || items.length === 0) {
        throw new BadRequestException(
          'Fatura oluşturmak için sipariş numarası veya satır kalemleri (items) gereklidir.',
        );
      }

      const invoiceNo = invoiceNumber || `INV-${Date.now()}`;
      const invoice = await this.prisma.invoice.create({
        data: {
          invoiceNo,
          customerName: customerName || 'Bilinmeyen Müşteri',
          taxId,
          taxOffice,
          amount: total || 0,
          taxRate: items[0]?.taxRate || 20,
          taxAmount: tax || 0,
          status: (status as InvoiceStatus) || 'DRAFT',
          items: items as any,
        },
      });

      this.generatePdf(invoice.id).catch((err) =>
        this.logger.error('PDF generation failed', err),
      );

      return invoice;
    }
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: InvoiceStatus;
    startDate?: string;
    endDate?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.startDate || query.endDate) {
      where.createdAt = {
        ...(query.startDate ? { gte: new Date(query.startDate) } : {}),
        ...(query.endDate ? { lte: new Date(query.endDate) } : {}),
      };
    }

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            include: { customer: true },
          },
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    const data = invoices.map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNo,
      type: 'SALES',
      customerId: invoice.order?.customerId,
      customer: invoice.order?.customer
        ? {
            firstName: invoice.order.customer.firstName,
            lastName: invoice.order.customer.lastName,
            phone: invoice.order.customer.phone,
          }
        : null,
      orderId: invoice.orderId,
      subtotal: Number(invoice.amount) - Number(invoice.taxAmount),
      tax: Number(invoice.taxAmount),
      total: Number(invoice.amount),
      status: invoice.status,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { order: true },
    });
    if (!invoice) throw new NotFoundException('Fatura bulunamadı');
    return invoice;
  }

  async updateStatus(id: string, status: InvoiceStatus) {
    if (!status) {
      throw new BadRequestException('Status is required');
    }
    await this.findOne(id);
    return this.prisma.invoice.update({
      where: { id },
      data: { status },
    });
  }

  async generatePdf(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        order: {
          include: {
            customer: true,
            items: { include: { variant: { include: { product: true } } } },
          },
        },
      },
    });

    if (!invoice) return;

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const fileName = `invoice-${invoice.invoiceNo}.pdf`;
    const uploadDir = path.join(process.cwd(), 'uploads', 'invoices');
    const fontsDir = path.join(process.cwd(), 'fonts');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // --- Sistem Mağaza Bilgilerini Çek ---
    const settingsRaw = await this.prisma.setting.findMany({
      where: {
        key: { in: ['storeName', 'storeAddress', 'storeEmail', 'storePhone'] },
      },
    });
    const settingsMap = Object.fromEntries(
      settingsRaw.map((s) => [s.key, s.value]),
    );

    const sName = settingsMap['storeName']?.toUpperCase() || 'PEYKER MODA';
    const sAddress = settingsMap['storeAddress'] || 'İstanbul, Türkiye';
    const sEmail = settingsMap['storeEmail'] || 'iletisim@peykermoda.com';
    const sPhone = settingsMap['storePhone'] || '+90 (555) 123 45 67';

    // Font Kayıtları (Türkçe Karakter Desteği İçin)
    const regularFontPath = path.join(fontsDir, 'Roboto-Regular.ttf');
    const boldFontPath = path.join(fontsDir, 'Roboto-Bold.ttf');

    if (fs.existsSync(regularFontPath)) {
      doc.registerFont('Roboto', regularFontPath);
    } else {
      doc.registerFont('Roboto', 'Helvetica'); // Fallback
    }

    if (fs.existsSync(boldFontPath)) {
      doc.registerFont('Roboto-Bold', boldFontPath);
    } else {
      doc.registerFont('Roboto-Bold', 'Helvetica-Bold'); // Fallback
    }

    const filePath = path.join(uploadDir, fileName);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // --- Renk Paleti ---
    const primaryColor = '#111827';
    const secondaryColor = '#4b5563';
    const lightGray = '#f9fafb'; // Daha yumuşak açık gri
    const headerBgColor = '#f3f4f6';
    const borderColor = '#e5e7eb';
    const accentColor = '#3b82f6'; // Mavi hafif vurgu (Gerekirse)

    // --- ÜST KISIM (HEADER) ---
    // Logo / Marka İsim
    doc
      .fillColor(primaryColor)
      .font('Roboto-Bold')
      .fontSize(28)
      .text(sName, 50, 50, { characterSpacing: 1 });

    // Şirket Bilgileri
    doc
      .fillColor(secondaryColor)
      .font('Roboto')
      .fontSize(10)
      .text(sAddress, 50, 85)
      .text(sEmail, 50, 100)
      .text(sPhone, 50, 115);

    // Fatura Etiketi
    doc
      .fillColor(primaryColor)
      .font('Roboto-Bold')
      .fontSize(22)
      .text('FATURA', 50, 50, { align: 'right', characterSpacing: 2 });

    // Fatura Numarası ve Tarih Kutusu (Sağa dayalı ve hizalı)
    doc
      .fillColor(secondaryColor)
      .font('Roboto-Bold')
      .fontSize(10)
      .text('Fatura No:', 380, 85, { width: 80, align: 'right' })
      .font('Roboto')
      .text(invoice.invoiceNo, 470, 85, { width: 75, align: 'right' });

    doc
      .font('Roboto-Bold')
      .text('Tarih:', 380, 100, { width: 80, align: 'right' })
      .font('Roboto')
      .text(invoice.createdAt.toLocaleDateString('tr-TR'), 470, 100, {
        width: 75,
        align: 'right',
      });

    // Çizgi Ayırıcı
    doc
      .moveTo(50, 145)
      .lineTo(545, 145)
      .lineWidth(1)
      .strokeColor(borderColor)
      .stroke();

    // --- MÜŞTERİ BİLGİLERİ ---
    // Sol blok Müşteri
    doc
      .fillColor(secondaryColor)
      .font('Roboto-Bold')
      .fontSize(10)
      .text('Fatura Edilen:', 50, 165);

    doc
      .fillColor(primaryColor)
      .font('Roboto-Bold')
      .fontSize(14)
      .text(invoice.customerName || 'Bilinmeyen Müşteri', 50, 180);

    if (invoice.taxId) {
      doc
        .fillColor(secondaryColor)
        .font('Roboto')
        .fontSize(10)
        .text(`Vergi / TC No: ${invoice.taxId}`, 50, 200);
    }
    if (invoice.order?.customer?.phone) {
      doc
        .fillColor(secondaryColor)
        .font('Roboto')
        .fontSize(10)
        .text(
          `Telefon: ${invoice.order.customer.phone}`,
          50,
          invoice.taxId ? 215 : 200,
        );
    }

    // --- TABLO BAŞLIĞI (HEADER) ---
    let currentY = 260;

    // Tablo başlık arkaplanı
    doc.roundedRect(50, currentY, 495, 30, 4).fill(headerBgColor);

    doc.fillColor(primaryColor).font('Roboto-Bold').fontSize(10);
    // Pixel-perfect hizalamalar (Y koordinatına +10 vererek tam ortaya alıyoruz)
    doc.text('Ürün Açıklaması', 65, currentY + 10);
    doc.text('Miktar', 320, currentY + 10, { width: 40, align: 'center' });
    doc.text('Birim Fiyat', 380, currentY + 10, { width: 70, align: 'right' });
    doc.text('Toplam', 460, currentY + 10, { width: 70, align: 'right' });

    currentY += 35; // Tablo gövdesine geçiş

    // --- KALEMLER (ITEMS) ---
    const isManual = !invoice.orderId && invoice.items;

    // Türkçe sayı formatı fonksiyonu
    const formatMoney = (val: number) =>
      new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
      }).format(val);

    const drawRow = (
      name: string,
      qty: number,
      price: number,
      total: number,
      index: number,
    ) => {
      // Şeritli arkaplan (Zebra striping)
      if (index % 2 === 0) {
        doc.rect(50, currentY - 5, 495, 25).fill(lightGray);
      }

      doc.font('Roboto').fontSize(10).fillColor(secondaryColor);
      doc.text(name, 65, currentY, { width: 250, height: 15, ellipsis: true });
      doc.font('Roboto-Bold').fillColor(primaryColor);
      doc.text(qty.toString(), 320, currentY, { width: 40, align: 'center' });
      doc.font('Roboto').fillColor(secondaryColor);
      doc.text(formatMoney(price), 380, currentY, {
        width: 70,
        align: 'right',
      });
      doc.font('Roboto-Bold').fillColor(primaryColor);
      doc.text(formatMoney(total), 460, currentY, {
        width: 70,
        align: 'right',
      });

      currentY += 20;

      // Eğer sayfa sonuna geldiyse yeni sayfa ekle
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }
    };

    if (isManual) {
      const manualItems = invoice.items as any[];
      manualItems.forEach((item, idx) => {
        const productName = item.productName || 'Ürün';
        const quantity = Number(item.quantity) || 1;
        const unitPrice = Number(item.unitPrice) || 0;
        drawRow(productName, quantity, unitPrice, quantity * unitPrice, idx);
      });
    } else if (invoice.order?.items) {
      invoice.order.items.forEach((item, idx) => {
        const productName = item.variant?.product?.name || 'Ürün';
        drawRow(
          productName,
          Number(item.quantity),
          Number(item.unitPrice),
          Number(item.total),
          idx,
        );
      });
    }

    // --- HESAP ÖZETİ (TOPLAMLAR) ---
    // Tablo altı ayırıcı
    currentY += 10;
    doc
      .moveTo(340, currentY)
      .lineTo(545, currentY)
      .lineWidth(1)
      .strokeColor(borderColor)
      .stroke();
    currentY += 15;

    const subtotal = Number(invoice.amount) - Number(invoice.taxAmount);
    const tax = Number(invoice.taxAmount);
    const totalAmount = Number(invoice.amount);

    doc.font('Roboto').fontSize(10).fillColor(secondaryColor);
    doc.text('Ara Toplam:', 330, currentY, { width: 100, align: 'right' });
    doc
      .font('Roboto-Bold')
      .fillColor(primaryColor)
      .text(formatMoney(subtotal), 440, currentY, {
        width: 90,
        align: 'right',
      });

    currentY += 20;
    doc
      .font('Roboto')
      .fillColor(secondaryColor)
      .text(`KDV (%${invoice.taxRate}):`, 330, currentY, {
        width: 100,
        align: 'right',
      });
    doc
      .font('Roboto-Bold')
      .fillColor(primaryColor)
      .text(formatMoney(tax), 440, currentY, { width: 90, align: 'right' });

    currentY += 25;
    // GENEL TOPLAM KUTUSU
    doc.roundedRect(320, currentY - 10, 225, 40, 6).fill(primaryColor);
    doc.fillColor('#ffffff').font('Roboto-Bold').fontSize(14);
    // Yazıları kutu içine tam ortalama
    doc.text('GENEL TOPLAM:', 330, currentY + 3, { width: 110, align: 'left' });
    doc.text(formatMoney(totalAmount), 440, currentY + 3, {
      width: 90,
      align: 'right',
    });

    // --- ALT BİLGİ (FOOTER) ---
    const pageHeight = doc.page.height;
    doc
      .moveTo(50, pageHeight - 70)
      .lineTo(545, pageHeight - 70)
      .lineWidth(0.5)
      .strokeColor(borderColor)
      .stroke();
    doc.fillColor(secondaryColor).font('Roboto').fontSize(9);
    doc.text(
      `${sName}'yı tercih ettiğiniz için teşekkür ederiz.`,
      50,
      pageHeight - 55,
      { align: 'center', width: 495 },
    );
    doc.text(
      'Mali değeri yoktur, bilgilendirme amaçlıdır.',
      50,
      pageHeight - 40,
      { align: 'center', width: 495 },
    );

    doc.end();

    // Update Invoice with PDF URL (Local path for now, usually would be S3 url)
    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        pdfUrl: `/uploads/invoices/${fileName}`,
        status: 'ISSUED',
      },
    });
    this.logger.log(`Fatura PDF oluşturuldu: ${fileName}`);
  }
  async getPdfPath(id: string) {
    const invoice = await this.findOne(id);
    if (!invoice.pdfUrl) {
      // Eğer PDF yoksa oluştur
      await this.generatePdf(id);
      // Tekrar çek
      const updated = await this.findOne(id);
      if (!updated.pdfUrl) throw new NotFoundException('PDF oluşturulamadı');
      return path.join(process.cwd(), updated.pdfUrl); // Absolute path for streaming
    }
    return path.join(process.cwd(), invoice.pdfUrl);
  }

  async createReturnInvoice(orderNumber: string, reason: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: { include: { variant: { include: { product: true } } } },
        customer: true,
      },
    });

    if (!order) {
      throw new NotFoundException(
        'Belirtilen sipariş numarasına ait sipariş bulunamadı.',
      );
    }

    // Create a Return record
    const returnRecord = await this.prisma.return.create({
      data: {
        orderId: order.id,
        reason,
        refundAmount: order.totalAmount,
        status: 'APPROVED',
      },
    });

    // Generate a PDF for the Return Invoice
    const doc = new PDFDocument({ margin: 50 });
    const fileName = `return-invoice-${orderNumber}-${Date.now()}.pdf`;
    const uploadDir = path.join(process.cwd(), 'uploads', 'invoices');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc.fontSize(20).text('Peyker Moda', { align: 'center' });
    doc.fontSize(12).text('İade Faturası', { align: 'center' });
    doc.moveDown();

    doc.fontSize(10).text(`İade Fatura No: IADE-${orderNumber}`);
    doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`);
    doc.text(
      `Müşteri: ${order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Bilinmeyen Müşteri'}`,
    );
    doc.text(`İade Nedeni: ${reason}`);
    doc.moveDown();

    doc.text('İade Edilen Ürünler:', { underline: true });
    order.items.forEach((item, index) => {
      const productName = item.variant?.product?.name || 'Ürün';
      doc.text(
        `${index + 1}. ${productName} x ${item.quantity} = ${item.total} TL`,
      );
    });
    doc.moveDown();

    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .text(
        `İade Edilecek Toplam Tutar: ${Number(order.totalAmount).toFixed(2)} TL`,
        { align: 'right' },
      );

    doc.end();

    return {
      success: true,
      message: 'İade faturası başarıyla oluşturuldu.',
      returnId: returnRecord.id,
      pdfUrl: `/uploads/invoices/${fileName}`,
    };
  }
}
