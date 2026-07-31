export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string;
}

export interface CouponData {
  code: string;
  valid: boolean;
  discount: number;
  discountType: "percentage" | "fixed";
  message: string;
}

export type AddCartItemInput = Omit<CartItem, "quantity"> & {
  quantity?: number;
};

export interface CartContextValue {
  items: CartItem[];
  addItem: (item: AddCartItemInput) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  coupon: CouponData | null;
  applyCoupon: (coupon: CouponData | null) => void;
}
