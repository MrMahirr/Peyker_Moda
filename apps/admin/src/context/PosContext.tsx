import React, { createContext, useContext, useReducer, ReactNode, useMemo } from 'react';

// Types
export interface Product {
    id: string;
    name: string;
    price: number;
    image?: string;
    category?: string;
}

export interface CartItem extends Product {
    quantity: number;
}

interface PosState {
    cart: CartItem[];
}

// Actions
type PosAction =
    | { type: 'ADD_TO_CART'; payload: Product }
    | { type: 'ADD_RETURN_ITEM'; payload: Product }
    | { type: 'REMOVE_FROM_CART'; payload: string }
    | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
    | { type: 'CLEAR_CART' };

const initialState: PosState = {
    cart: [],
};

// Helper: Calculate totals
export const calculateTotals = (cart: CartItem[]) => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxRate = 0.10; // 10% KDV example
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    return { subtotal, tax, total };
};

const posReducer = (state: PosState, action: PosAction): PosState => {
    switch (action.type) {
        case 'ADD_TO_CART': {
            const existingItemIndex = state.cart.findIndex(item => item.id === action.payload.id && item.quantity > 0);

            if (existingItemIndex > -1) {
                // Item exists, increment quantity
                const newCart = [...state.cart];
                newCart[existingItemIndex].quantity += 1;
                return { ...state, cart: newCart };
            } else {
                // New item
                return {
                    ...state,
                    cart: [...state.cart, { ...action.payload, quantity: 1 }]
                };
            }
        }
        case 'ADD_RETURN_ITEM': {
            // Returns are always distinct entries or negative quantity
            const existingItemIndex = state.cart.findIndex(item => item.id === action.payload.id && item.quantity < 0);

            if (existingItemIndex > -1) {
                // Item exists in return mode, decrement quantity (make more negative)
                const newCart = [...state.cart];
                newCart[existingItemIndex].quantity -= 1;
                return { ...state, cart: newCart };
            } else {
                // New return item
                return {
                    ...state,
                    cart: [...state.cart, { ...action.payload, quantity: -1 }]
                };
            }
        }
        case 'REMOVE_FROM_CART':
            return {
                ...state,
                cart: state.cart.filter(item => item.id !== action.payload)
            };
        case 'UPDATE_QUANTITY': {
            const { id, quantity } = action.payload;
            if (quantity <= 0) {
                return {
                    ...state,
                    cart: state.cart.filter(item => item.id !== id)
                };
            }

            return {
                ...state,
                cart: state.cart.map(item =>
                    item.id === id ? { ...item, quantity } : item
                )
            };
        }
        case 'CLEAR_CART':
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
        dispatch({ type: 'ADD_TO_CART', payload: product });
    };

    const addReturnItem = (product: Product) => {
        dispatch({ type: 'ADD_RETURN_ITEM', payload: product });
    };

    const removeFromCart = (productId: string) => {
        dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
    };

    const updateQuantity = (productId: string, quantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    const value = {
        cart: state.cart,
        totals,
        addToCart,
        addReturnItem,
        removeFromCart,
        updateQuantity,
        clearCart
    };

    return (
        <PosContext.Provider value={value}>
            {children}
        </PosContext.Provider>
    );
};

export const usePos = () => {
    const context = useContext(PosContext);
    if (context === undefined) {
        throw new Error('usePos must be used within a PosProvider');
    }
    return context;
};
