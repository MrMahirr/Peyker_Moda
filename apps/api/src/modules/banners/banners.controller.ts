import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
import { BannerQueryDto, CreateBannerDto, UpdateBannerDto } from './dto';

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

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
}
