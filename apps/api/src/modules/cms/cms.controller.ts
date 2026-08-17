import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from '../../common/decorators';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { CmsBlogPostsService } from './cms-blog-posts.service';
import { CmsFaqsService } from './cms-faqs.service';
import { CmsPagesService } from './cms-pages.service';
import {
  CreateBlogPostDto,
  CreateCmsPageDto,
  CreateFaqItemDto,
  UpdateBlogPostDto,
  UpdateCmsPageDto,
  UpdateFaqItemDto,
} from './dto';

@ApiTags('CMS')
@Controller('cms')
export class CmsController {
  constructor(
    private readonly blogPostsService: CmsBlogPostsService,
    private readonly pagesService: CmsPagesService,
    private readonly faqsService: CmsFaqsService,
  ) {}

  @Get('public/blog-posts')
  @ApiOperation({ summary: 'Yayindaki blog yazilarini getir' })
  async getPublishedBlogPosts() {
    return this.blogPostsService.findAll(false);
  }

  @Get('public/blog-posts/:slug')
  @ApiOperation({ summary: 'Yayindaki blog yazisi detayi' })
  async getPublishedBlogPost(@Param('slug') slug: string) {
    return this.blogPostsService.findPublishedBySlug(slug);
  }

  @Get('public/pages/:slug')
  @ApiOperation({ summary: 'Yayindaki sayfa detayi' })
  async getPublishedPage(@Param('slug') slug: string) {
    return this.pagesService.findPublishedBySlug(slug);
  }

  @Get('public/faqs')
  @ApiOperation({ summary: 'Aktif SSS kayitlarini getir' })
  async getActiveFaqs() {
    return this.faqsService.findAll(false);
  }

  @Get('blog-posts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Tum blog yazilarini getir' })
  async getBlogPosts() {
    return this.blogPostsService.findAll(true);
  }

  @Post('blog-posts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Blog yazisi olustur' })
  async createBlogPost(
    @Body() dto: CreateBlogPostDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.blogPostsService.create(dto, userId);
  }

  @Patch('blog-posts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Blog yazisi guncelle' })
  async updateBlogPost(
    @Param('id') id: string,
    @Body() dto: UpdateBlogPostDto,
  ) {
    return this.blogPostsService.update(id, dto);
  }

  @Delete('blog-posts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Blog yazisi sil' })
  async removeBlogPost(@Param('id') id: string) {
    return this.blogPostsService.remove(id);
  }

  @Get('pages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Tum CMS sayfalarini getir' })
  async getPages() {
    return this.pagesService.findAll(true);
  }

  @Post('pages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'CMS sayfasi olustur' })
  async createPage(@Body() dto: CreateCmsPageDto) {
    return this.pagesService.create(dto);
  }

  @Patch('pages/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'CMS sayfasi guncelle' })
  async updatePage(@Param('id') id: string, @Body() dto: UpdateCmsPageDto) {
    return this.pagesService.update(id, dto);
  }

  @Delete('pages/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'CMS sayfasi sil' })
  async removePage(@Param('id') id: string) {
    return this.pagesService.remove(id);
  }

  @Get('faqs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Tum SSS kayitlarini getir' })
  async getFaqs() {
    return this.faqsService.findAll(true);
  }

  @Post('faqs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'SSS kaydi olustur' })
  async createFaq(@Body() dto: CreateFaqItemDto) {
    return this.faqsService.create(dto);
  }

  @Patch('faqs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'SSS kaydi guncelle' })
  async updateFaq(@Param('id') id: string, @Body() dto: UpdateFaqItemDto) {
    return this.faqsService.update(id, dto);
  }

  @Delete('faqs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'SSS kaydi sil' })
  async removeFaq(@Param('id') id: string) {
    return this.faqsService.remove(id);
  }
}
