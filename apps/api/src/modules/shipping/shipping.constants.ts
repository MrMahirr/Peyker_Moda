import { ShipmentStatus } from '@prisma/client';
import { ShipmentStatusResult } from '../cargo/providers/cargo.provider.interface';

export const ACTIVE_DELIVERY_STATUSES: ShipmentStatus[] = [
  ShipmentStatus.PREPARING,
  ShipmentStatus.PICKED_UP,
  ShipmentStatus.IN_TRANSIT,
  ShipmentStatus.OUT_FOR_DELIVERY,
];

export function mapCargoStatusToShipmentStatus(
  status: ShipmentStatusResult['status'],
): ShipmentStatus {
  switch (status) {
    case 'created':
      return ShipmentStatus.PREPARING;
    case 'transfer_center':
      return ShipmentStatus.IN_TRANSIT;
    case 'delivery_branch':
      return ShipmentStatus.OUT_FOR_DELIVERY;
    case 'out_for_delivery':
      return ShipmentStatus.OUT_FOR_DELIVERY;
    case 'delivered':
      return ShipmentStatus.DELIVERED;
    default:
      return ShipmentStatus.IN_TRANSIT;
  }
}

export function getTrackingLocation(
  status: ShipmentStatusResult['status'],
): string {
  switch (status) {
    case 'created':
      return 'Depo';
    case 'transfer_center':
      return 'Transfer Merkezi';
    case 'delivery_branch':
      return 'Dagitim Subesi';
    case 'out_for_delivery':
      return 'Kurye Dagitimda';
    case 'delivered':
      return 'Teslim Noktasi';
    default:
      return 'Bilinmiyor';
  }
}
