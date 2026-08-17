import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { BarcodeService } from './barcode.service';

@ApiTags('Barcode')
@Controller('barcode')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BarcodeController {
  constructor(private readonly barcodeService: BarcodeService) {}

  @Post('generate-missing')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Barkodu olmayan tüm varyantlara otomatik barkod ata',
  })
  async generateMissingBarcodes() {
    const result = await this.barcodeService.assignMissingBarcodes();
    return { data: result };
  }

  @Get('generate')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Tek bir benzersiz EAN-13 barkod üret' })
  async generateSingleBarcode() {
    const barcode = await this.barcodeService.generateUniqueBarcode();
    return { data: { barcode } };
  }
}
