import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  UpdateStockDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Ürün listesi (filtreleme ve sayfalama ile)' })
  @ApiResponse({ status: 200, description: 'Ürün listesi döner' })
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get('search')
  @ApiOperation({ summary: 'Ürün arama' })
  @ApiResponse({ status: 200, description: 'Arama sonuçları' })
  async search(@Query('q') term: string, @Query('limit') limit?: number) {
    return this.productsService.search(term, limit);
  }

  @Get('barcode/:barcode')
  @ApiOperation({ summary: 'Barkod ile ürün ara (POS için)' })
  @ApiResponse({ status: 200, description: 'Ürün bulundu' })
  @ApiResponse({ status: 404, description: 'Ürün bulunamadı' })
  async findByBarcode(@Param('barcode') barcode: string) {
    return this.productsService.findByBarcode(barcode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ürün detayı' })
  @ApiResponse({ status: 200, description: 'Ürün bulundu' })
  @ApiResponse({ status: 404, description: 'Ürün bulunamadı' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Yeni ürün oluştur' })
  @ApiResponse({ status: 201, description: 'Ürün oluşturuldu' })
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Ürün güncelle' })
  @ApiResponse({ status: 200, description: 'Ürün güncellendi' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Patch('variants/:variantId/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager', 'staff')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Varyant stoğunu güncelle' })
  async updateStock(
    @Param('variantId') variantId: string,
    @Body() updateStockDto: UpdateStockDto,
  ) {
    return this.productsService.updateStock(variantId, updateStockDto.stock);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Ürün sil' })
  @ApiResponse({ status: 200, description: 'Ürün silindi' })
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
