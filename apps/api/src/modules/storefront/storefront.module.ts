import { Module } from '@nestjs/common';
import { StorefrontController } from './storefront.controller';
import { StorefrontService } from './storefront.service';
import { CampaignsModule } from '../campaigns/campaigns.module';

@Module({
    imports: [CampaignsModule],
    controllers: [StorefrontController],
    providers: [StorefrontService],
    exports: [StorefrontService],
})
export class StorefrontModule { }
