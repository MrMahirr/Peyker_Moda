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
  items: { variantId: string; quantity: number }[];
  shippingAddress: {
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    district?: string;
    postalCode?: string;
  };
  paymentMethod: "CASH" | "CREDIT_CARD" | "BANK_TRANSFER";
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
  paymentStatus?: string;
  subtotal?: number | string;
  discountAmount?: number | string;
  shippingCost?: number | string;
  total?: number | string;
  totalAmount?: number | string;
  paidAmount?: number | string;
  shippingAddress?: string;
  paymentMethod?: string;
  cargoTrackingCode?: string;
  cargoProvider?: string;
  items?: Array<{
    id?: string;
    variantId?: string;
    productName?: string;
    quantity: number;
    unitPrice: number | string;
    variant?: {
      size?: string;
      color?: string;
      product?: {
        name?: string;
        images?: string[];
      };
    };
  }>;
  returnInfo?: {
    hasReturn: boolean;
    latestStatus: string | null;
    returnCount: number;
    totalReturnableQuantity: number;
    totalRequestedQuantity: number;
    totalCompletedQuantity: number;
    returnableAmount: number;
    returnableItems: Array<{
      orderItemId: string;
      variantId: string;
      orderedQuantity: number;
      requestedQuantity: number;
      completedQuantity: number;
      returnableQuantity: number;
      unitRefundAmount: number;
    }>;
    returns: Array<{
      id: string;
      status: string;
      reason: string;
      refundAmount: number | string;
      createdAt: string;
      updatedAt: string;
      items: Array<{
        variantId: string;
        quantity: number;
        reason?: string | null;
      }>;
    }>;
  };
  createdAt: string;
  updatedAt: string;
  payments?: Array<{
    method: string;
    status: string;
    amount: number | string;
  }>;
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
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  total: number;
  createdAt: string;
  items?: Array<{ name: string; quantity: number; price: number }>;
  shippingAddress?: string;
  trackingNumber?: string;
}

export interface CollectionData {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  accentColor: string;
  products: Product[];
}

export interface CardInfo {
  cardHolderName: string;
  cardNumber: string;
  expireMonth: string;
  expireYear: string;
  cvc: string;
}

export interface ProductQueryParams {
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
}

export interface ProductListResult {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CouponValidationResult {
  valid: boolean;
  discount: number;
  discountType: "percentage" | "fixed";
  message: string;
}

export interface BannerContent {
  id: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl: string;
  link?: string;
  order: number;
  position?: number;
}

export interface PageHeaderContent {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface CollectionContent {
  id: string;
  name: string;
  imageUrl: string;
  slug?: string;
  position: number;
  isActive: boolean;
}

export interface AttributeResponse {
  sizes: string[];
  colors: Array<{ name: string; value: string }>;
}

export type ApiRecord = Record<string, unknown>;

export interface FavoriteResponse extends ApiRecord {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  category?: string;
  inStock: boolean;
}

export interface AddressResponse extends ApiRecord {
  id: string;
  title: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postalCode: string;
  isDefault: boolean;
  type: "home" | "work";
}

export type AddressPayload = Partial<AddressResponse> & ApiRecord;

export interface InvoiceResponse extends ApiRecord {
  success?: boolean;
  url?: string;
  message?: string;
}

export interface ReturnResponse extends ApiRecord {
  error?: boolean;
  message?: string;
}

export interface ReturnRequestPayload {
  reason: string;
  notes?: string;
  items: Array<{
    variantId: string;
    quantity: number;
    reason?: string;
  }>;
}
