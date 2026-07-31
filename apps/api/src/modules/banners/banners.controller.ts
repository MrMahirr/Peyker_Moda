import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { BannersService } from './banners.service';
import { PageHeadersService } from './page-headers.service';
import { CollectionContentService } from './collection-content.service';
import { BannerQueryDto, CreateBannerDto, UpdateBannerDto } from './dto';

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
  constructor(
    private readonly bannersService: BannersService,
    private readonly pageHeadersService: PageHeadersService,
    private readonly collectionContentService: CollectionContentService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Banner listesi' })
  async findAll(@Query() query: BannerQueryDto) {
    return this.bannersService.findAll(query.includeInactive ?? true);
  }

  @Get('active')
  @ApiOperation({ summary: 'Aktif banner listesi' })
  async findActive() {
    return this.bannersService.findActive();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Banner olustur' })
  async create(@Body() dto: CreateBannerDto) {
    return this.bannersService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Banner guncelle' })
  async update(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.bannersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Banner sil' })
  async remove(@Param('id') id: string) {
    return this.bannersService.remove(id);
  }

  // --- PAGE HEADERS ---
  @Get('page-headers/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Sayfa başlıkları listesi (Admin)' })
  async getAllPageHeaders() {
    return this.pageHeadersService.findAll();
  }

  @Put('page-headers/:pageSlug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Sayfa başlığı oluştur/güncelle' })
  async upsertPageHeader(@Param('pageSlug') pageSlug: string, @Body() dto: any) {
    return this.pageHeadersService.upsert(pageSlug, dto);
  }

  // --- COLLECTION CONTENT ---
  @Get('collection-content/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Koleksiyon içerikleri listesi (Admin)' })
  async getAllCollectionContents() {
    return this.collectionContentService.findAll(true);
  }

  @Post('collection-content')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Koleksiyon içeriği ekle' })
  async createCollectionContent(@Body() dto: any) {
    return this.collectionContentService.create(dto);
  }

  @Patch('collection-content/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Koleksiyon içeriği güncelle' })
  async updateCollectionContent(@Param('id') id: string, @Body() dto: any) {
    return this.collectionContentService.update(id, dto);
  }

  @Delete('collection-content/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Koleksiyon içeriği sil' })
  async removeCollectionContent(@Param('id') id: string) {
    return this.collectionContentService.remove(id);
  }
}
