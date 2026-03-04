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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto, CategoryQueryDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    @ApiOperation({ summary: 'Kategori listesi' })
    @ApiResponse({ status: 200, description: 'Kategori listesi döner' })
    async findAll(@Query() query: CategoryQueryDto) {
        return this.categoriesService.findAll(query);
    }

    @Get('tree')
    @ApiOperation({ summary: 'Kategori ağacı (tree yapısında)' })
    @ApiResponse({ status: 200, description: 'Kategori ağacı döner' })
    async findTree() {
        return this.categoriesService.findTree();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Kategori detayı' })
    @ApiResponse({ status: 200, description: 'Kategori bulundu' })
    @ApiResponse({ status: 404, description: 'Kategori bulunamadı' })
    async findOne(@Param('id') id: string) {
        return this.categoriesService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'manager')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Yeni kategori oluştur' })
    @ApiResponse({ status: 201, description: 'Kategori oluşturuldu' })
    @ApiResponse({ status: 409, description: 'Bu isimde kategori var' })
    async create(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoriesService.create(createCategoryDto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'manager')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Kategori güncelle' })
    @ApiResponse({ status: 200, description: 'Kategori güncellendi' })
    @ApiResponse({ status: 404, description: 'Kategori bulunamadı' })
    async update(
        @Param('id') id: string,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ) {
        return this.categoriesService.update(id, updateCategoryDto);
    }

    @Patch(':id/order')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'manager')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Kategori sıralamasını güncelle' })
    async updateOrder(
        @Param('id') id: string,
        @Body('order') order: number,
    ) {
        return this.categoriesService.updateOrder(id, order);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Kategori sil' })
    @ApiResponse({ status: 200, description: 'Kategori silindi' })
    @ApiResponse({ status: 404, description: 'Kategori bulunamadı' })
    async remove(@Param('id') id: string) {
        return this.categoriesService.remove(id);
    }
}
