import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvoiceDto } from './dto';
import { InvoiceStatus } from '@prisma/client';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class InvoicesService {
    private readonly logger = new Logger(InvoicesService.name);

    constructor(private readonly prisma: PrismaService) { }

    async createFromOrder(createInvoiceDto: CreateInvoiceDto) {
        const { orderId } = createInvoiceDto;

        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: { include: { variant: { include: { product: true } } } },
                customer: true,
                user: true,
                invoice: true
            }
        });

        if (!order) {
            throw new NotFoundException('Sipariş bulunamadı');
        }

        if (order.invoice) {
            throw new BadRequestException('Bu sipariş için zaten fatura oluşturulmuş');
        }

        // Fatura No oluştur (Örnek: INV-20240001)
        const invoiceNo = `INV-${Date.now()}`;

        // Vergi hesaplama (Basit mantık: İçinden %20 KDV ayırma veya üzerine ekleme - burada içinden ayırıyoruz varsayalım)
        // Türkiye'de genelde fiyatlar KDV dahil olur perakendede.
        // Tax Base = Total / 1.20
        // Tax Amount = Total - Tax Base
        const totalAmount = Number(order.totalAmount);
        const taxRate = 20;
        const taxBase = totalAmount / (1 + taxRate / 100);
        const taxAmount = totalAmount - taxBase;

        const invoice = await this.prisma.invoice.create({
            data: {
                invoiceNo,
                orderId,
                customerName: order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Misafir Müşteri',
                taxId: createInvoiceDto.taxId,
                taxOffice: createInvoiceDto.taxOffice,
                amount: totalAmount,
                taxRate,
                taxAmount: Number(taxAmount.toFixed(2)),
                status: 'DRAFT'
            }
        });

        // PDF Oluşturma (Asenkron yapılabilir)
        this.generatePdf(invoice.id).catch(err => this.logger.error('PDF generation failed', err));

        return invoice;
    }

    async findAll(query: { page?: number; limit?: number; status?: InvoiceStatus; startDate?: string; endDate?: string }) {
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
        const invoice = await this.prisma.invoice.findUnique({ where: { id }, include: { order: true } });
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
                    include: { items: { include: { variant: { include: { product: true } } } } }
                }
            }
        });

        if (!invoice) return;

        const doc = new PDFDocument({ margin: 50 });
        const fileName = `invoice-${invoice.invoiceNo}.pdf`;
        const uploadDir = path.join(process.cwd(), 'uploads', 'invoices');

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, fileName);
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('Peyker Moda', { align: 'center' });
        doc.fontSize(12).text('Fatura', { align: 'center' });
        doc.moveDown();

        // Info
        doc.fontSize(10).text(`Fatura No: ${invoice.invoiceNo}`);
        doc.text(`Tarih: ${invoice.createdAt.toLocaleDateString('tr-TR')}`);
        doc.text(`Müşteri: ${invoice.customerName}`);
        if (invoice.taxId) doc.text(`Vergi No: ${invoice.taxId}`);
        doc.moveDown();

        // Items
        doc.text('Ürünler:', { underline: true });
        invoice.order?.items.forEach((item, index) => {
            const productName = item.variant?.product?.name || 'Ürün';
            doc.text(`${index + 1}. ${productName} x ${item.quantity} = ${item.total} TL`);
        });
        doc.moveDown();

        // Totals
        doc.text(`Ara Toplam (KDV Hariç): ${(Number(invoice.amount) - Number(invoice.taxAmount)).toFixed(2)} TL`, { align: 'right' });
        doc.text(`KDV (%${invoice.taxRate}): ${Number(invoice.taxAmount).toFixed(2)} TL`, { align: 'right' });
        doc.font('Helvetica-Bold').fontSize(12).text(`Genel Toplam: ${Number(invoice.amount).toFixed(2)} TL`, { align: 'right' });

        doc.end();

        // Update Invoice with PDF URL (Local path for now, usually would be S3 url)
        await this.prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                pdfUrl: `/uploads/invoices/${fileName}`,
                status: 'ISSUED'
            }
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
}
