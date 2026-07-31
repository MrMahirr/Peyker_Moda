import { Module, Global } from '@nestjs/common';
import { CargoService } from './cargo.service';
import { MockCargoProvider } from './providers/mock.cargo.provider';
import { CARGO_PROVIDER } from './cargo.constants';

@Global()
@Module({
  providers: [
    MockCargoProvider,
    {
      provide: CARGO_PROVIDER,
      useExisting: MockCargoProvider,
    },
    CargoService,
  ],
  exports: [CargoService],
})
export class CargoModule {}
