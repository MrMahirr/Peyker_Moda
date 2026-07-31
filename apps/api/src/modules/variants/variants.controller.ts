import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { VariantsService } from './variants.service';
import { CreateVariantDto, UpdateVariantDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';

@ApiTags('Variants')
@Controller()
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Get('products/:productId/variants')
  @ApiOperation({ summary: 'Ürüne ait varyant listesi' })
  @ApiResponse({ status: 200, description: 'Varyant listesi' })
  async findByProduct(@Param('productId') productId: string) {
    return this.variantsService.findByProduct(productId);
  }

  @Get('variants/:id')
  @ApiOperation({ summary: 'Varyant detayı' })
  @ApiResponse({ status: 200, description: 'Varyant bulundu' })
  @ApiResponse({ status: 404, description: 'Varyant bulunamadı' })
  async findOne(@Param('id') id: string) {
    return this.variantsService.findOne(id);
  }

  @Post('products/:productId/variants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Yeni varyant ekle' })
  @ApiResponse({ status: 201, description: 'Varyant oluşturuldu' })
  async create(
    @Param('productId') productId: string,
    @Body() createVariantDto: CreateVariantDto,
  ) {
    return this.variantsService.create(productId, createVariantDto);
  }

  @Post('products/:productId/variants/bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toplu varyant oluştur (beden x renk)' })
  async bulkCreate(
    @Param('productId') productId: string,
    @Body()
    body: {
      sizes: string[];
      colors: { name: string; code?: string }[];
      baseStock?: number;
    },
  ) {
    return this.variantsService.bulkCreate(
      productId,
      body.sizes,
      body.colors,
      body.baseStock,
    );
  }

  @Patch('variants/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Varyant güncelle' })
  async update(
    @Param('id') id: string,
    @Body() updateVariantDto: UpdateVariantDto,
  ) {
    return this.variantsService.update(id, updateVariantDto);
  }

  @Delete('variants/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Varyant sil' })
  async remove(@Param('id') id: string) {
    return this.variantsService.remove(id);
  }
}
