import { Module } from '@nestjs/common';
import { CustomerAnalyticsService } from './customer-analytics.service';
import { CustomerNotesService } from './customer-notes.service';
import { CustomerNotesStorageService } from './customer-notes.storage.service';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

@Module({
    controllers: [CustomersController],
    providers: [
        CustomersService,
        CustomerNotesService,
        CustomerNotesStorageService,
        CustomerAnalyticsService,
    ],
    exports: [CustomersService],
})
export class CustomersModule { }
