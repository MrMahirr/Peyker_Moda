import { Module } from '@nestjs/common';
import { CustomerNotesService } from './customer-notes.service';
import { CustomerNotesStorageService } from './customer-notes.storage.service';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

@Module({
    controllers: [CustomersController],
    providers: [CustomersService, CustomerNotesService, CustomerNotesStorageService],
    exports: [CustomersService],
})
export class CustomersModule { }
