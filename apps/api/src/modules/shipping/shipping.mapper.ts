import { Carrier, Shipment, ShippingRate } from '@prisma/client';

type ShipmentWithRelations = Shipment & {
  order?: { orderNumber: string } | null;
  carrier?: { name: string } | null;
};

function toNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  return Number(value);
}

export function toCarrierResponse(carrier: Carrier) {
  return {
    id: carrier.id,
    name: carrier.name,
    code: carrier.code,
    apiKey: carrier.apiKey,
    isActive: carrier.isActive,
    logo: carrier.logo,
  };
}

export function toShipmentResponse(shipment: ShipmentWithRelations) {
  return {
    id: shipment.id,
    orderId: shipment.orderId,
    orderNumber: shipment.order?.orderNumber,
    carrierId: shipment.carrierId,
    carrierName: shipment.carrier?.name,
    trackingNumber: shipment.trackingNumber,
    status: shipment.status,
    recipientName: shipment.recipientName,
    recipientPhone: shipment.recipientPhone,
    recipientAddress: shipment.recipientAddress,
    weight: toNumber(shipment.weight),
    desi: toNumber(shipment.desi),
    shippingCost: Number(shipment.shippingCost),
    estimatedDelivery: shipment.estimatedDelivery?.toISOString(),
    deliveredAt: shipment.deliveredAt?.toISOString(),
    createdAt: shipment.createdAt.toISOString(),
  };
}

export function toShippingRateResponse(
  rate: ShippingRate & { carrier?: { name: string } | null },
) {
  return {
    id: rate.id,
    carrierId: rate.carrierId,
    carrierName: rate.carrier?.name,
    minWeight: Number(rate.minWeight),
    maxWeight: Number(rate.maxWeight),
    zone: rate.zone,
    price: Number(rate.price),
    isActive: rate.isActive,
  };
}
