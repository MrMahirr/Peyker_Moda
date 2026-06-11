import { Order as ApiOrder } from "@/lib/api";
import { Order } from "../types";
import {
  getPaymentMethodLabel,
  getStatusCode,
  getStatusLabel,
  getStepIndex,
} from "./orderLabels";
import { toMoney } from "./orderMoney";

interface ShippingAddress {
  address?: string;
  district?: string;
  city?: string;
}

const formatAddress = (shippingAddress: ApiOrder["shippingAddress"]) => {
  const address = shippingAddress as ShippingAddress | null | undefined;
  if (!address) return "Adres bilgisi mevcut degil";

  return [address.address, address.district, address.city]
    .filter(Boolean)
    .join(", ");
};

export const transformOrder = (apiOrder: ApiOrder): Order => {
  const total = toMoney(apiOrder.totalAmount ?? apiOrder.total);
  const itemsSubtotal =
    apiOrder.items?.reduce(
      (sum, item) => sum + toMoney(item.unitPrice) * (item.quantity || 1),
      0,
    ) ?? 0;
  const subtotal = toMoney(apiOrder.subtotal) || itemsSubtotal;
  const discountAmount = toMoney(apiOrder.discountAmount);
  const shippingCost = toMoney(apiOrder.shippingCost);
  const completedPaymentTotal =
    apiOrder.payments
      ?.filter((payment) => payment.status === "COMPLETED")
      .reduce((sum, payment) => sum + toMoney(payment.amount), 0) ?? 0;
  const paidAmount =
    toMoney(apiOrder.paidAmount) ||
    completedPaymentTotal ||
    (apiOrder.paymentStatus === "COMPLETED" ? total : 0);

  return {
    id: apiOrder.id,
    orderNumber:
      apiOrder.orderNumber ||
      `SIP-${apiOrder.id?.toString().slice(0, 6)}` ||
      `order-${Math.random().toString(36).slice(2, 11)}`,
    date: new Date(apiOrder.createdAt).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    status: getStatusLabel(apiOrder.status),
    statusCode: getStatusCode(apiOrder.status),
    stepIndex: getStepIndex(apiOrder.status),
    total,
    subtotal,
    discountAmount,
    shippingCost,
    paidAmount,
    remainingAmount: Math.max(0, total - paidAmount),
    paymentStatus:
      apiOrder.paymentStatus || apiOrder.payments?.[0]?.status || "PENDING",
    address: formatAddress(apiOrder.shippingAddress),
    paymentMethod: getPaymentMethodLabel(
      apiOrder.payments?.[0]?.method || apiOrder.paymentMethod,
    ),
    cargoTrackingCode: apiOrder.cargoTrackingCode,
    cargoProvider: apiOrder.cargoProvider,
    items:
      apiOrder.items?.map(
        (item: NonNullable<ApiOrder["items"]>[number], index: number) => ({
          id: index,
          name: item.productName || item.variant?.product?.name || "Urun",
          image:
            item.variant?.product?.images?.[0] ||
            "https://via.placeholder.com/300",
          price: toMoney(item.unitPrice),
          quantity: item.quantity || 1,
          size: item.variant?.size || "-",
          color: item.variant?.color || "-",
        }),
      ) || [],
  };
};
