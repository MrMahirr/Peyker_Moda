import { API_BASE_URL } from "./config";
import { CouponValidationResult } from "./types";

export const couponService = {
  async validateCoupon(
    code: string,
    cartTotal = 0,
  ): Promise<CouponValidationResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, cartTotal }),
      });
      const data = await response.json();
      if (!response.ok) {
        let errorMsg = "Gecersiz kupon kodu";
        if (data.message) {
          errorMsg = Array.isArray(data.message)
            ? data.message[0]
            : data.message;
        }
        return {
          valid: false,
          discount: 0,
          discountType: "percentage",
          message: errorMsg,
        };
      }

      const result = data.data || data;
      return {
        valid: true,
        discount: result.coupon?.discountValue || result.discount || 0,
        discountType:
          result.coupon?.discountType === "PERCENTAGE" ? "percentage" : "fixed",
        message: "Kupon basariyla uygulandi!",
      };
    } catch {
      return {
        valid: false,
        discount: 0,
        discountType: "percentage",
        message: "Kupon dogrulanamadi",
      };
    }
  },
};
