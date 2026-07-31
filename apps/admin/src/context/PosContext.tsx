/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useMemo,
} from "react";

// Types
export interface Product {
  id: string;
  variantId: string;
  name: string;
  price: number;
  stock?: number;
  image?: string;
  category?: string;
  sourceOrderId?: string;
  sourceOrderItemId?: string;
  returnReason?: string;
}

export type PosLineType = "SALE" | "RETURN" | "EXCHANGE";

export interface CartItem extends Product {
  id: string;
  variantId: string;
  quantity: number;
  lineType: PosLineType;
  sourceOrderId?: string;
  sourceOrderItemId?: string;
  returnReason?: string;
}

interface PosState {
  cart: CartItem[];
}

// Actions
type PosAction =
  | { type: "ADD_TO_CART"; payload: Product }
  | { type: "ADD_RETURN_ITEM"; payload: Product }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" };

const initialState: PosState = {
  cart: [],
};

// Helper: Calculate totals
export const calculateTotals = (cart: CartItem[]) => {
  const subtotal = cart.reduce((sum, item) => {
    const multiplier = item.lineType === "RETURN" ? -1 : 1;
    return sum + item.price * item.quantity * multiplier;
  }, 0);
  const taxRate = 0.1; // 10% KDV example
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  return { subtotal, tax, total };
};

const getVariantId = (product: Product) => product.variantId || product.id;

const createCartLineId = (product: Product, lineType: PosLineType) => {
  const variantId = getVariantId(product);
  const source = product.sourceOrderItemId || product.sourceOrderId || "direct";
  return `${lineType}:${variantId}:${source}`;
};

const createCartItem = (product: Product, lineType: PosLineType): CartItem => ({
  ...product,
  id: createCartLineId(product, lineType),
  variantId: getVariantId(product),
  quantity: 1,
  lineType,
});

const posReducer = (state: PosState, action: PosAction): PosState => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const lineId = createCartLineId(action.payload, "SALE");
      const existingItemIndex = state.cart.findIndex(
        (item) => item.id === lineId,
      );

      if (existingItemIndex > -1) {
        // Item exists, increment quantity
        const newCart = [...state.cart];
        const existingItem = newCart[existingItemIndex];
        if (
          typeof existingItem.stock === "number" &&
          existingItem.quantity >= existingItem.stock
        ) {
          return state;
        }
        newCart[existingItemIndex].quantity += 1;
        return { ...state, cart: newCart };
      } else {
        // New item
        return {
          ...state,
          cart: [...state.cart, createCartItem(action.payload, "SALE")],
        };
      }
    }
    case "ADD_RETURN_ITEM": {
      const lineId = createCartLineId(action.payload, "RETURN");
      const existingItemIndex = state.cart.findIndex(
        (item) => item.id === lineId,
      );

      if (existingItemIndex > -1) {
        // Item exists in return mode, increment positive quantity.
        const newCart = [...state.cart];
        newCart[existingItemIndex].quantity += 1;
        return { ...state, cart: newCart };
      } else {
        // New return item
        return {
          ...state,
          cart: [...state.cart, createCartItem(action.payload, "RETURN")],
        };
      }
    }
    case "REMOVE_FROM_CART":
      return {
        ...state,
        cart: state.cart.filter((item) => item.id !== action.payload),
      };
    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          cart: state.cart.filter((item) => item.id !== id),
        };
      }

      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity:
                  typeof item.stock === "number" && item.lineType !== "RETURN"
                    ? Math.min(Math.abs(quantity), item.stock)
                    : Math.abs(quantity),
              }
            : item,
        ),
      };
    }
    case "CLEAR_CART":
      return initialState;
    default:
      return state;
  }
};

interface PosContextType {
  cart: CartItem[];
  totals: { subtotal: number; tax: number; total: number };
  addToCart: (product: Product) => void;
  addReturnItem: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

export const PosProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(posReducer, initialState);

  // Derived state for totals
  const totals = useMemo(() => calculateTotals(state.cart), [state.cart]);

  // Actions wrappers
  const addToCart = (product: Product) => {
    dispatch({ type: "ADD_TO_CART", payload: product });
  };

  const addReturnItem = (product: Product) => {
    dispatch({ type: "ADD_RETURN_ITEM", payload: product });
  };

  const removeFromCart = (productId: string) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: productId });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id: productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const value = {
    cart: state.cart,
    totals,
    addToCart,
    addReturnItem,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <PosContext.Provider value={value}>{children}</PosContext.Provider>;
};

export const usePos = () => {
  const context = useContext(PosContext);
  if (context === undefined) {
    throw new Error("usePos must be used within a PosProvider");
  }
  return context;
};
