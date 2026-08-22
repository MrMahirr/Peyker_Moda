import { Module } from '@nestjs/common';
import { BannersController } from './banners.controller';
import { BannersService } from './banners.service';
import { BannerStorageService } from './banner.storage.service';
import { PageHeadersService } from './page-headers.service';
import { PageHeaderStorageService } from './page-header.storage.service';

@Module({
  controllers: [BannersController],
  providers: [
    BannersService,
    BannerStorageService,
    PageHeadersService,
    PageHeaderStorageService,
  ],
})
export class BannersModule {}
