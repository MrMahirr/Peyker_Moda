export type CarrierCode = 'ARAS' | 'MNG' | 'YURTICI' | 'PTT' | 'SURAT' | 'UPS' | 'OTHER';
export type ShipmentStatus = 'PREPARING' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'RETURNED' | 'FAILED';

export interface Carrier { id: string; name: string; code: CarrierCode; apiKey?: string; isActive: boolean; logo?: string; }
export interface Shipment { id: string; orderId: string; orderNumber?: string; carrierId: string; carrierName?: string; trackingNumber: string; status: ShipmentStatus; recipientName: string; recipientPhone: string; recipientAddress: string; weight?: number; desi?: number; shippingCost: number; estimatedDelivery?: string; deliveredAt?: string; createdAt: string; }
export interface ShippingRate { id: string; carrierId: string; carrierName?: string; minWeight: number; maxWeight: number; zone: string; price: number; }
