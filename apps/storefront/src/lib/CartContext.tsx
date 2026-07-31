"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

import {
  addCartItem,
  removeCartItem,
  updateCartItemQuantity,
} from "./cart/cartItems";
import { calculateItemCount, calculateSubtotal } from "./cart/calculations";
import {
  readCartItems,
  readCoupon,
  writeCartItems,
  writeCoupon,
} from "./cart/storage";
import {
  AddCartItemInput,
  CartContextValue,
  CartItem,
  CouponData,
} from "./cart/types";

export type { CartItem, CouponData } from "./cart/types";

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(readCartItems);
  const [coupon, setCoupon] = useState<CouponData | null>(readCoupon);

  useEffect(() => {
    writeCartItems(items);
  }, [items]);

  useEffect(() => {
    writeCoupon(coupon);
  }, [coupon]);

  const addItem = useCallback((item: AddCartItemInput) => {
    setItems((currentItems) => addCartItem(currentItems, item));
    toast.success(`${item.name} sepete eklendi`, {
      description: item.variant ? `Varyant: ${item.variant}` : undefined,
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((currentItems) => removeCartItem(currentItems, id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((currentItems) =>
      updateCartItemQuantity(currentItems, id, quantity),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCoupon(null);
  }, []);

  const applyCoupon = useCallback((newCoupon: CouponData | null) => {
    setCoupon(newCoupon);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount: calculateItemCount(items),
      subtotal: calculateSubtotal(items),
      coupon,
      applyCoupon,
    }),
    [
      addItem,
      applyCoupon,
      clearCart,
      coupon,
      items,
      removeItem,
      updateQuantity,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
