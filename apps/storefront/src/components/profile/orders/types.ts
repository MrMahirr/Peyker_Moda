export type OrderStatus =
  | "processing"
  | "shipped"
  | "delivered"
  | "returned"
  | "cancelled"
  | "pending";

export interface OrderItem {
  id: string;
  variantId?: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  returnableQuantity: number;
  size: string;
  color: string;
}

export interface OrderReturnInfo {
  hasReturn: boolean;
  latestStatus: string | null;
  returnCount: number;
  totalReturnableQuantity: number;
  totalRequestedQuantity: number;
  totalCompletedQuantity: number;
  returnableAmount: number;
  returns: Array<{
    id: string;
    status: string;
    reason: string;
    refundAmount: number | string;
    createdAt: string;
  }>;
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
  returnInfo?: OrderReturnInfo;
  items: OrderItem[];
}
