import { Module } from '@nestjs/common';
import { OrderNotesService } from './order-notes.service';
import { OrderNotesStorageService } from './order-notes.storage.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrderNotesService, OrderNotesStorageService],
  exports: [OrdersService],
})
export class OrdersModule {}
