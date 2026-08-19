import { Module } from '@nestjs/common';
import { PriceListsController } from './price-lists.controller';
import { PriceListsReferenceService } from './price-lists-reference.service';
import { PriceListsService } from './price-lists.service';
import { PriceListsStorageService } from './price-lists-storage.service';

@Module({
  controllers: [PriceListsController],
  providers: [
    PriceListsService,
    PriceListsReferenceService,
    PriceListsStorageService,
  ],
  exports: [PriceListsService],
})
export class PriceListsModule {}
