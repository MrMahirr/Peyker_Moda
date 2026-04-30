import { Module } from '@nestjs/common';
import { BannersController } from './banners.controller';
import { BannersService } from './banners.service';
import { BannerStorageService } from './banner.storage.service';

@Module({
  controllers: [BannersController],
  providers: [BannersService, BannerStorageService],
})
export class BannersModule {}
