import { AddCartItemInput, CartItem } from "./types";

export const addCartItem = (
  items: CartItem[],
  item: AddCartItemInput,
): CartItem[] => {
  const quantityToAdd = item.quantity || 1;
  const existingItem = items.find((currentItem) => currentItem.id === item.id);

  if (existingItem) {
    return items.map((currentItem) =>
      currentItem.id === item.id
        ? { ...currentItem, quantity: currentItem.quantity + quantityToAdd }
        : currentItem,
    );
  }

  return [...items, { ...item, quantity: quantityToAdd }];
};

export const removeCartItem = (items: CartItem[], id: string): CartItem[] =>
  items.filter((item) => item.id !== id);

export const updateCartItemQuantity = (
  items: CartItem[],
  id: string,
  quantity: number,
): CartItem[] => {
  if (quantity <= 0) {
    return removeCartItem(items, id);
  }

  return items.map((item) => (item.id === id ? { ...item, quantity } : item));
};
