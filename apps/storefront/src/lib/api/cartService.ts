import { API_BASE_URL } from "./config";
import { CartCalculation, CartItem } from "./types";

export const cartService = {
  async calculateCart(
    items: CartItem[],
    couponCode?: string,
  ): Promise<CartCalculation> {
    try {
      const response = await fetch(`${API_BASE_URL}/store/cart/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, couponCode }),
      });
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Failed to calculate cart:", error);
      throw error;
    }
  },
};
