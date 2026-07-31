import { getAccessToken, getAuthHeaders } from "./authStorage";
import { API_BASE_URL, getApiOrigin } from "./config";
import {
  InvoiceResponse,
  Order,
  ReturnRequestPayload,
  ReturnResponse,
  TrackedOrder,
} from "./types";

export const orderService = {
  async trackOrder(
    orderNumber: string,
    phone: string,
  ): Promise<TrackedOrder | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/store/orders/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, phone }),
      });
      const data = await response.json();
      if (!response.ok || !data.data) return null;
      return {
        ...data.data,
        total: data.data.totalAmount,
      };
    } catch (error) {
      console.error("Failed to track order:", error);
      return null;
    }
  },

  async getOrders(): Promise<Order[]> {
    try {
      const token = getAccessToken();
      if (!token) return [];

      const response = await fetch(`${API_BASE_URL}/store/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      return [];
    }
  },

  async createReturn(
    orderId: string,
    payload: ReturnRequestPayload,
  ): Promise<ReturnResponse> {
    const token = getAccessToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(
      `${API_BASE_URL}/store/orders/${orderId}/return`,
      {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload),
      },
    );
    return response.json();
  },

  async getInvoice(orderId: string): Promise<InvoiceResponse> {
    const token = getAccessToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(
      `${API_BASE_URL}/store/orders/${orderId}/invoice`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Fatura alinamadi");
    }

    if (typeof data.url === "string" && data.url.startsWith("/")) {
      return {
        ...data,
        url: `${getApiOrigin()}${data.url}`,
      };
    }

    return data;
  },
};
