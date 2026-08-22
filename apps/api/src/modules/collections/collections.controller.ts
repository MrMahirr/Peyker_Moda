import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
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
import { CollectionsService } from './collections.service';
import {
  CreateCollectionDto,
  UpdateCollectionDto,
  CollectionQueryDto,
  SetCollectionProductsDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';

@ApiTags('Collections')
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  @ApiOperation({ summary: 'Koleksiyon listesi' })
  @ApiResponse({ status: 200, description: 'Koleksiyon listesi döner' })
  async findAll(@Query() query: CollectionQueryDto) {
    return this.collectionsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Koleksiyon detayı (ürünleriyle birlikte)' })
  @ApiResponse({ status: 200, description: 'Koleksiyon bulundu' })
  @ApiResponse({ status: 404, description: 'Koleksiyon bulunamadı' })
  async findOne(@Param('id') id: string) {
    return this.collectionsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Yeni koleksiyon oluştur' })
  @ApiResponse({ status: 201, description: 'Koleksiyon oluşturuldu' })
  @ApiResponse({ status: 409, description: 'Bu URL ile koleksiyon var' })
  async create(@Body() dto: CreateCollectionDto) {
    return this.collectionsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Koleksiyon güncelle' })
  @ApiResponse({ status: 200, description: 'Koleksiyon güncellendi' })
  @ApiResponse({ status: 404, description: 'Koleksiyon bulunamadı' })
  async update(@Param('id') id: string, @Body() dto: UpdateCollectionDto) {
    return this.collectionsService.update(id, dto);
  }

  @Patch(':id/order')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Koleksiyon sıralamasını güncelle' })
  async updateOrder(@Param('id') id: string, @Body('order') order: number) {
    return this.collectionsService.updateOrder(id, order);
  }

  @Put(':id/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Koleksiyonun ürün listesini tamamen değiştir' })
  async setProducts(
    @Param('id') id: string,
    @Body() dto: SetCollectionProductsDto,
  ) {
    return this.collectionsService.setProducts(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Koleksiyon sil' })
  @ApiResponse({ status: 200, description: 'Koleksiyon silindi' })
  @ApiResponse({ status: 404, description: 'Koleksiyon bulunamadı' })
  async remove(@Param('id') id: string) {
    return this.collectionsService.remove(id);
  }
}
