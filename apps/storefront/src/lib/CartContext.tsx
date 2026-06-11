'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

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
    discountType: 'percentage' | 'fixed';
    message: string;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    itemCount: number;
    subtotal: number;
    coupon: CouponData | null;
    applyCoupon: (coupon: CouponData | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>(() => {
        if (typeof window === 'undefined') return [];
        const saved = localStorage.getItem('peyker-cart');
        if (!saved) return [];

        try {
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed as CartItem[] : [];
        } catch (e) {
            console.error('Cart parse error:', e);
            return [];
        }
    });

    const [coupon, setCoupon] = useState<CouponData | null>(() => {
        if (typeof window === 'undefined') return null;
        const saved = localStorage.getItem('peyker-coupon');
        if (!saved) return null;
        try {
            return JSON.parse(saved) as CouponData;
        } catch (e) {
            console.error('Coupon parse error:', e);
            return null;
        }
    });

    useEffect(() => {
        localStorage.setItem('peyker-cart', JSON.stringify(items));
    }, [items]);

    useEffect(() => {
        if (coupon) {
            localStorage.setItem('peyker-coupon', JSON.stringify(coupon));
        } else {
            localStorage.removeItem('peyker-coupon');
        }
    }, [coupon]);

    const addItem = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
        const qtyToAdd = item.quantity || 1;
        setItems(prev => {
            const exists = prev.find(i => i.id === item.id);
            if (exists) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + qtyToAdd } : i);
            }
            return [...prev, { ...item, quantity: qtyToAdd }];
        });
        toast.success(`${item.name} sepete eklendi`, {
            description: item.variant ? `Varyant: ${item.variant}` : undefined,
        });
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(id);
            return;
        }
        setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
    };

    const clearCart = () => {
        setItems([]);
        setCoupon(null);
    };

    const applyCoupon = (newCoupon: CouponData | null) => {
        setCoupon(newCoupon);
    };

    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal, coupon, applyCoupon }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};
