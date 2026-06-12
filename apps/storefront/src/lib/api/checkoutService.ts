import { getAccessToken, getAuthHeaders } from "./authStorage";
import { API_BASE_URL } from "./config";
import { CardInfo, CheckoutData, OrderResult } from "./types";

export const checkoutService = {
  async createOrder(checkoutData: CheckoutData): Promise<OrderResult> {
    try {
      const headers = getAuthHeaders(true);

      const response = await fetch(`${API_BASE_URL}/store/checkout`, {
        method: "POST",
        headers,
        body: JSON.stringify(checkoutData),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Siparis olusturulamadi");
      return data.data;
    } catch (error) {
      console.error("Failed to create order:", error);
      throw error;
    }
  },

  async initializePayment(data: {
    orderId: string;
    cardInfo: CardInfo;
  }): Promise<{ status: string; threeDSecureUrl?: string }> {
    const token = getAccessToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/payments/initialize`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Odeme baslatilamadi");
    return result;
  },
};
