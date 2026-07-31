export interface CreateShipmentParams {
    orderId: string;
    customerName: string;
    customerAddress: string;
    customerPhone: string;
    items: any[];
}

export interface CreateShipmentResult {
    trackingCode: string;
    provider: string;
    status: 'PENDING' | 'SHIPPED';
    trackingUrl?: string; // Optional URL for tracking page
}

export interface ShipmentStatusResult {
    status: 'created' | 'transfer_center' | 'delivery_branch' | 'out_for_delivery' | 'delivered';
    description: string;
    updatedAt: Date;
}

export interface CargoProvider {
    createShipment(params: CreateShipmentParams): Promise<CreateShipmentResult>;
    checkStatus(trackingCode: string): Promise<ShipmentStatusResult>;
}
