import { Module, Global } from '@nestjs/common';
import { CargoService } from './cargo.service';
import { MockCargoProvider } from './providers/mock.cargo.provider';

@Global()
@Module({
    providers: [CargoService],
    exports: [CargoService],
})
export class CargoModule { }
