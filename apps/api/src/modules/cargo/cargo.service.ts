import { Inject, Injectable, Logger } from '@nestjs/common';
import type { CargoProvider } from './providers/cargo.provider.interface';
import { CreateShipmentParams, CreateShipmentResult, ShipmentStatusResult } from './providers/cargo.provider.interface';
import { CARGO_PROVIDER } from './cargo.constants';

@Injectable()
export class CargoService {
    private readonly logger = new Logger(CargoService.name);

    constructor(@Inject(CARGO_PROVIDER) private readonly provider: CargoProvider) {}

    async createShipment(params: CreateShipmentParams): Promise<CreateShipmentResult> {
        this.logger.log('Creating shipment', { orderId: params.orderId, provider: this.provider.constructor.name });
        return this.provider.createShipment(params);
    }

    async checkStatus(trackingCode: string): Promise<ShipmentStatusResult> {
        return this.provider.checkStatus(trackingCode);
    }
}
