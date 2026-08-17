import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { generateBarcode } from '../../common/utils';

@Injectable()
export class BarcodeService {
  private readonly logger = new Logger(BarcodeService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Benzersiz EAN-13 barkod üret
   * Veritabanında aynı barkodun olmadığını garanti eder.
   */
  async generateUniqueBarcode(): Promise<string> {
    const MAX_ATTEMPTS = 10;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const barcode = generateBarcode();

      const existingVariant = await this.prisma.variant.findUnique({
        where: { barcode },
      });

      const existingProduct = await this.prisma.product.findUnique({
        where: { barcode },
      });

      if (!existingVariant && !existingProduct) {
        return barcode;
      }
    }

    throw new Error('Benzersiz barkod üretilemedi. Lütfen tekrar deneyin.');
  }

  /**
   * Barkodu olmayan tüm varyantlara otomatik barkod ata
   */
  async assignMissingBarcodes(): Promise<{
    updatedCount: number;
    barcodes: { variantId: string; sku: string; barcode: string }[];
  }> {
    const variantsWithoutBarcode = await this.prisma.variant.findMany({
      where: { barcode: null },
      select: { id: true, sku: true },
    });

    if (variantsWithoutBarcode.length === 0) {
      return { updatedCount: 0, barcodes: [] };
    }

    const results: { variantId: string; sku: string; barcode: string }[] = [];

    for (const variant of variantsWithoutBarcode) {
      const barcode = await this.generateUniqueBarcode();

      await this.prisma.variant.update({
        where: { id: variant.id },
        data: { barcode },
      });

      results.push({
        variantId: variant.id,
        sku: variant.sku,
        barcode,
      });
    }

    this.logger.log(`${results.length} varyanta otomatik barkod atandı.`);

    return { updatedCount: results.length, barcodes: results };
  }
}
