export type OrderStatus =
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "pending";

export interface OrderItem {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  statusCode: OrderStatus;
  stepIndex: number;
  total: number;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: string;
  address: string;
  paymentMethod: string;
  cargoTrackingCode?: string;
  cargoProvider?: string;
  cargoLink?: string;
  items: OrderItem[];
}
