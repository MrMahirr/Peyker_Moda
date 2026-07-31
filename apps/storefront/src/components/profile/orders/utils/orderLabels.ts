import { OrderStatus } from "../types";

const STATUS_CODE_MAP: Record<string, OrderStatus> = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  RETURNED: "returned",
  CANCELLED: "cancelled",
};

const STEP_INDEX_MAP: Record<string, number> = {
  PENDING: 0,
  PROCESSING: 1,
  SHIPPED: 2,
  DELIVERED: 3,
  RETURNED: 3,
  CANCELLED: -1,
};

const STATUS_LABEL_MAP: Record<string, string> = {
  PENDING: "Siparis Alindi",
  PROCESSING: "Hazirlaniyor",
  SHIPPED: "Kargoya Verildi",
  DELIVERED: "Teslim Edildi",
  RETURNED: "Iade Edildi",
  CANCELLED: "Iptal Edildi",
};

const PAYMENT_STATUS_LABEL_MAP: Record<string, string> = {
  PENDING: "Bekliyor",
  PARTIAL: "Kismi Odendi",
  COMPLETED: "Odendi",
  FAILED: "Basarisiz",
  REFUNDED: "Iade Edildi",
};

const PAYMENT_METHOD_LABEL_MAP: Record<string, string> = {
  CASH: "Kapida Odeme",
  CREDIT_CARD: "Kredi Karti",
  BANK_TRANSFER: "Banka Transferi",
};

export const getStatusCode = (status: string): OrderStatus =>
  STATUS_CODE_MAP[status] || "pending";

export const getStepIndex = (status: string): number =>
  STEP_INDEX_MAP[status] ?? 0;

export const getStatusLabel = (status: string): string =>
  STATUS_LABEL_MAP[status] || status;

export const getPaymentStatusLabel = (status: string): string =>
  PAYMENT_STATUS_LABEL_MAP[status] || status;

export const getPaymentMethodLabel = (method?: string): string =>
  method ? PAYMENT_METHOD_LABEL_MAP[method] || method : "Belirtilmedi";
