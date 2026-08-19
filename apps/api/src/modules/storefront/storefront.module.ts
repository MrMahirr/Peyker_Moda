import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import type { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StorefrontController } from './storefront.controller';
import { StorefrontService } from './storefront.service';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { ReturnsModule } from '../returns/returns.module';
import { CustomerJwtStrategy } from './strategies/customer-jwt.strategy';
import { PageHeaderStorageService } from '../banners/page-header.storage.service';
import { CollectionContentStorageService } from '../banners/collection-content.storage.service';
import { BannerStorageService } from '../banners/banner.storage.service';
import { PriceListsModule } from '../price-lists/price-lists.module';

type JwtExpiresIn = NonNullable<
  NonNullable<JwtModuleOptions['signOptions']>['expiresIn']
>;

@Module({
  imports: [
    CampaignsModule,
    InvoicesModule,
    ReturnsModule,
    PriceListsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret:
          config.get<string>('app.jwtSecret') ||
          'super-secret-key-change-in-production',
        signOptions: {
          expiresIn: (config.get<string>('app.jwtExpiresIn') ||
            '1d') as JwtExpiresIn,
        },
      }),
    }),
  ],
  controllers: [StorefrontController],
  providers: [
    StorefrontService,
    CustomerJwtStrategy,
    PageHeaderStorageService,
    CollectionContentStorageService,
    BannerStorageService,
  ],
  exports: [StorefrontService],
})
export class StorefrontModule {}
