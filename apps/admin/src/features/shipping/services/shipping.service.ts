import api from '../../../lib/axios';
import type { Carrier, Shipment, ShipmentStatus, ShippingRate } from '../types';

export const shippingService = {
    async getCarriers(): Promise<Carrier[]> { return (await api.get('/shipping/carriers')).data.data; },
    async createCarrier(data: Partial<Carrier>): Promise<Carrier> { return (await api.post('/shipping/carriers', data)).data.data; },
    async updateCarrier(id: string, data: Partial<Carrier>): Promise<Carrier> { return (await api.patch(`/shipping/carriers/${id}`, data)).data.data; },
    async deleteCarrier(id: string): Promise<void> { await api.delete(`/shipping/carriers/${id}`); },

    async getShipments(status?: ShipmentStatus): Promise<Shipment[]> { const q = status ? `?status=${status}` : ''; return (await api.get(`/shipping/shipments${q}`)).data.data; },
    async createShipment(data: Partial<Shipment>): Promise<Shipment> { return (await api.post('/shipping/shipments', data)).data.data; },
    async updateStatus(id: string, status: ShipmentStatus): Promise<Shipment> { return (await api.patch(`/shipping/shipments/${id}/status`, { status })).data.data; },
    async trackShipment(id: string): Promise<{ events: { date: string; status: string; location: string }[] }> { return (await api.get(`/shipping/shipments/${id}/track`)).data.data; },

    async getRates(carrierId?: string): Promise<ShippingRate[]> { const q = carrierId ? `?carrierId=${carrierId}` : ''; return (await api.get(`/shipping/rates${q}`)).data.data; },
    async createRate(data: Partial<ShippingRate>): Promise<ShippingRate> { return (await api.post('/shipping/rates', data)).data.data; },

    async getDeliveryReport(startDate: string, endDate: string): Promise<{ delivered: number; returned: number; inTransit: number; avgDeliveryDays: number }> { return (await api.get(`/shipping/reports?startDate=${startDate}&endDate=${endDate}`)).data.data; },
};
