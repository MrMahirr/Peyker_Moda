import { Module } from '@nestjs/common';
import { CustomersModule } from '../customers/customers.module';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyPointsService } from './loyalty-points.service';
import { LoyaltyStorageService } from './loyalty-storage.service';
import { LoyaltyTierService } from './loyalty-tier.service';

@Module({
  imports: [CustomersModule],
  controllers: [LoyaltyController],
  providers: [
    LoyaltyStorageService,
    LoyaltyTierService,
    LoyaltyPointsService,
  ],
})
export class LoyaltyModule {}
