import { Injectable, Logger } from '@nestjs/common';
import {
  CargoProvider,
  CreateShipmentParams,
  CreateShipmentResult,
  ShipmentStatusResult,
} from './cargo.provider.interface';

@Injectable()
export class MockCargoProvider implements CargoProvider {
  private readonly logger = new Logger(MockCargoProvider.name);

  async createShipment(
    params: CreateShipmentParams,
  ): Promise<CreateShipmentResult> {
    this.logger.log(`Creating mock shipment for Order #${params.orderId}`);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const trackingCode = `MOCK-${Math.floor(Math.random() * 1000000)}`;

    return {
      trackingCode,
      provider: 'MOCK_CARGO',
      status: 'SHIPPED',
      trackingUrl: `http://localhost:3000/kargo-takip/${trackingCode}`,
    };
  }

  async checkStatus(trackingCode: string): Promise<ShipmentStatusResult> {
    this.logger.log(`Checking status for tracking code: ${trackingCode}`);

    // Return random status for demo purposes
    const statuses: ShipmentStatusResult['status'][] = [
      'created',
      'transfer_center',
      'delivery_branch',
      'out_for_delivery',
      'delivered',
    ];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      status: randomStatus,
      description: `Package is currently at ${randomStatus.replace('_', ' ')}`,
      updatedAt: new Date(),
    };
  }
}
