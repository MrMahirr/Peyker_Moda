// Storefront API Service - Backend Integration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    children?: Category[];
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
    category?: {
        id: string;
        name: string;
        slug: string;
    };
    stock: number;
    sku: string;
    variants?: ProductVariant[];
    tags?: string[];
    createdAt: string;
}

export interface ProductVariant {
    id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
    attributes: Record<string, string>;
}

export interface CartItem {
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
}

export interface CartCalculation {
    items: CartItem[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    appliedCoupon?: {
        code: string;
        discountAmount: number;
    };
}

export interface CheckoutData {
    items: CartItem[];
    customer: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
    shippingAddress: {
        street: string;
        city: string;
        district: string;
        postalCode: string;
    };
    paymentMethod: 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER';
    couponCode?: string;
    notes?: string;
}

export interface OrderResult {
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
}

export interface Order {
    id: string;
    orderNumber?: string;
    status: string;
    total: number;
    shippingAddress?: string;
    paymentMethod?: string;
    cargoTrackingCode?: string;
    cargoProvider?: string;
    items?: Array<{
        productName?: string;
        quantity: number;
        unitPrice: number;
        variant?: {
            size?: string;
            color?: string;
            product?: {
                name?: string;
                images?: string[];
            };
        };
    }>;
    createdAt: string;
    updatedAt: string;
}

export interface StoreUser {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
}

export interface TrackedOrder {
    id: string;
    orderNumber: string;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    total: number;
    createdAt: string;
    items?: Array<{ name: string; quantity: number; price: number }>;
    shippingAddress?: string;
    trackingNumber?: string;
}

export interface CollectionData {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    coverImage: string;
    accentColor: string;
    categorySlug?: string;
    products?: Product[];
}

export interface CardInfo {
    cardHolderName: string;
    cardNumber: string;
    expireMonth: string;
    expireYear: string;
    cvc: string;
}

// API Service
export const storeApi = {
    // Categories
    async getCategories(): Promise<Category[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/store/categories`);
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            return [];
        }
    },

    async getCategoryBySlug(slug: string): Promise<Category | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/store/categories/${slug}`);
            const data = await response.json();
            return data.data || null;
        } catch (error) {
            console.error('Failed to fetch category:', error);
            return null;
        }
    },

    // Products
    async getProducts(params?: {
        categorySlug?: string;
        search?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
        onSale?: boolean;
        sizes?: string[];
        colors?: string[];
        minPrice?: number;
        maxPrice?: number;
    }): Promise<{ products: Product[]; total: number; page: number; totalPages: number }> {
        try {
            const searchParams = new URLSearchParams();
            if (params?.categorySlug) {
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.categorySlug);
                if (isUuid) {
                    searchParams.append('categoryId', params.categorySlug);
                } else {
                    searchParams.append('categorySlug', params.categorySlug);
                }
            }
            if (params?.search) searchParams.append('search', params.search);
            if (params?.page) searchParams.append('page', String(params.page));
            if (params?.limit) searchParams.append('limit', String(params.limit));
            if (params?.sortBy) searchParams.append('sort', params.sortBy);
            if (params?.onSale) searchParams.append('onSale', 'true');
            if (params?.sizes && params.sizes.length > 0) searchParams.append('sizes', params.sizes.join(','));
            if (params?.colors && params.colors.length > 0) searchParams.append('colors', params.colors.join(','));
            if (params?.minPrice) searchParams.append('minPrice', String(params.minPrice));
            if (params?.maxPrice) searchParams.append('maxPrice', String(params.maxPrice));

            const response = await fetch(`${API_BASE_URL}/store/products?${searchParams}`);
            const data = await response.json();
            return {
                products: data.data || [],
                total: data.meta?.total || 0,
                page: data.meta?.page || 1,
                totalPages: data.meta?.totalPages || 1
            };
        } catch (error) {
            console.error('Failed to fetch products:', error);
            return { products: [], total: 0, page: 1, totalPages: 1 };
        }
    },

    async getProductBySlug(slug: string): Promise<Product | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/store/products/${slug}`);
            const data = await response.json();
            return data.data || null;
        } catch (error) {
            console.error('Failed to fetch product:', error);
            return null;
        }
    },

    async getFeaturedProducts(): Promise<Product[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/store/products?featured=true&limit=8`);
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Failed to fetch featured products:', error);
            return [];
        }
    },

    async getSaleProducts(): Promise<Product[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/store/products?onSale=true&limit=8`);
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Failed to fetch sale products:', error);
            return [];
        }
    },

    // Cart
    async calculateCart(items: CartItem[], couponCode?: string): Promise<CartCalculation> {
        try {
            const response = await fetch(`${API_BASE_URL}/store/cart/calculate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items, couponCode })
            });
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Failed to calculate cart:', error);
            throw error;
        }
    },

    // Checkout
    async createOrder(checkoutData: CheckoutData): Promise<OrderResult> {
        try {
            const response = await fetch(`${API_BASE_URL}/store/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(checkoutData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Sipariş oluşturulamadı');
            return data.data;
        } catch (error) {
            console.error('Failed to create order:', error);
            throw error;
        }
    },

    // Payment Initialization
    async initializePayment(data: { orderId: string; cardInfo: CardInfo }): Promise<{ status: string; threeDSecureUrl?: string }> {
        const token = localStorage.getItem('accessToken');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}/payments/initialize`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Ödeme başlatılamadı');
        return result;
    },

    // Order Tracking
    async trackOrder(orderNumber: string, phone: string): Promise<TrackedOrder | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/store/orders/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderNumber, phone })
            });
            const data = await response.json();
            if (!response.ok || !data.data) return null;
            return {
                ...data.data,
                total: data.data.totalAmount
            };
        } catch (error) {
            console.error('Failed to track order:', error);
            return null;
        }
    },

    // Get user orders
    async getOrders(): Promise<Order[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/store/orders`);
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            return [];
        }
    },

    // Auth
    async login(email: string, password: string): Promise<{ accessToken: string; user: StoreUser }> {
        const response = await fetch(`${API_BASE_URL}/store/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Giriş başarısız');
        return data;
    },

    async loginGoogle(idToken: string): Promise<{ accessToken: string; user: StoreUser }> {
        const response = await fetch(`${API_BASE_URL}/store/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Google giriş başarısız');
        return data;
    },

    async register(userData: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        password: string;
    }): Promise<{ success: boolean; message: string }> {
        const response = await fetch(`${API_BASE_URL}/store/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Kayıt başarısız');
        return data;
    },

    async logout(): Promise<void> {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
    },

    isLoggedIn(): boolean {
        if (typeof window === 'undefined') return false;
        return !!localStorage.getItem('accessToken');
    },

    getUser(): StoreUser | null {
        if (typeof window === 'undefined') return null;
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    async getCurrentUser(): Promise<StoreUser | null> {
        if (typeof window === 'undefined') return null;
        const token = localStorage.getItem('accessToken');
        if (!token) return null;

        const response = await fetch(`${API_BASE_URL}/store/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status === 401) {
            await this.logout();
            return null;
        }

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Profil bilgileri alinamadi');

        const user = data.data || data.user || data;
        localStorage.setItem('user', JSON.stringify(user));
        return user;
    },

    // Coupon validation
    async validateCoupon(code: string): Promise<{ valid: boolean; discount: number; discountType: 'percentage' | 'fixed'; message: string }> {
        try {
            const response = await fetch(`${API_BASE_URL}/coupons/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            const data = await response.json();
            if (!response.ok) {
                return { valid: false, discount: 0, discountType: 'percentage', message: data.message || 'Geçersiz kupon kodu' };
            }
            return {
                valid: true,
                discount: data.data.discount,
                discountType: data.data.discountType || 'percentage',
                message: 'Kupon uygulandı!'
            };
        } catch (error) {
            return { valid: false, discount: 0, discountType: 'percentage', message: 'Kupon doğrulanamadı' };
        }
    },

    // Banners / Hero Slides
    async getBanners(position?: string): Promise<Array<{ id: string; title: string; imageUrl: string; link?: string; order: number }>> {
        try {
            const params = position ? `?position=${position}` : '';
            const response = await fetch(`${API_BASE_URL}/store/banners${params}`);
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Failed to fetch banners:', error);
            return [];
        }
    },

    // Top Products (Best Sellers)
    async getTopProducts(limit = 10): Promise<Product[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/store/products?sortBy=bestselling&limit=${limit}`);
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Failed to fetch top products:', error);
            return [];
        }
    },

    // New Arrivals
    async getNewArrivals(limit = 8): Promise<Product[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/store/products?sortBy=newest&limit=${limit}`);
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Failed to fetch new arrivals:', error);
            return [];
        }
    },

    async getCollectionBySlug(slug: string): Promise<CollectionData | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/store/collections/${slug}`);
            const data = await response.json();
            return data.data || null;
        } catch (error) {
            console.error('Failed to fetch collection:', error);
            return null;
        }
    },

    async getAttributes(): Promise<{ sizes: string[]; colors: Array<{ name: string; value: string }> }> {
        try {
            const response = await fetch(`${API_BASE_URL}/store/attributes`);
            const data = await response.json();
            return data.data || { sizes: [], colors: [] };
        } catch (error) {
            console.error('Failed to fetch attributes:', error);
            return { sizes: [], colors: [] };
        }
    },
};

