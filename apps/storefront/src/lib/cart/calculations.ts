import { CartItem } from "./types";

export const calculateItemCount = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.quantity, 0);

export const calculateSubtotal = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.price * item.quantity, 0);
