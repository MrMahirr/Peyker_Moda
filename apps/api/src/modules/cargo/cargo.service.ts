import { Injectable, Logger } from '@nestjs/common';
import { CargoProvider, CreateShipmentParams, CreateShipmentResult, ShipmentStatusResult } from './providers/cargo.provider.interface';
import { MockCargoProvider } from './providers/mock.cargo.provider';

@Injectable()
export class CargoService {
    private readonly logger = new Logger(CargoService.name);
    private provider: CargoProvider;

    constructor() {
        // In a real scenario, this could be injected or selected based on config
        this.provider = new MockCargoProvider();
    }

    async createShipment(params: CreateShipmentParams): Promise<CreateShipmentResult> {
        this.logger.log(`Creating shipment for Order #${params.orderId} via ${this.provider.constructor.name}`);
        return this.provider.createShipment(params);
    }

    async checkStatus(trackingCode: string): Promise<ShipmentStatusResult> {
        return this.provider.checkStatus(trackingCode);
    }
}
