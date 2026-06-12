import { CartItem, CouponData } from "./types";

const CART_STORAGE_KEY = "peyker-cart";
const COUPON_STORAGE_KEY = "peyker-coupon";

const canUseStorage = () => typeof window !== "undefined";

export const readCartItems = (): CartItem[] => {
  if (!canUseStorage()) return [];

  const saved = localStorage.getItem(CART_STORAGE_KEY);
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch (error) {
    console.error("Cart parse error:", error);
    return [];
  }
};

export const writeCartItems = (items: CartItem[]) => {
  if (!canUseStorage()) return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
};

export const readCoupon = (): CouponData | null => {
  if (!canUseStorage()) return null;

  const saved = localStorage.getItem(COUPON_STORAGE_KEY);
  if (!saved) return null;

  try {
    return JSON.parse(saved) as CouponData;
  } catch (error) {
    console.error("Coupon parse error:", error);
    return null;
  }
};

export const writeCoupon = (coupon: CouponData | null) => {
  if (!canUseStorage()) return;

  if (coupon) {
    localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
    return;
  }

  localStorage.removeItem(COUPON_STORAGE_KEY);
};
