"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { InvoiceButton, OrderActions } from "./OrderActions";
import { OrderDetailModal } from "./OrderDetailModal";
import { OrderItemsList } from "./OrderItemsList";
import { OrderPaymentSummary } from "./OrderPaymentSummary";
import { OrderStatusStepper } from "./OrderStatusStepper";
import { OrderTrackingModal } from "./OrderTrackingModal";
import { useOrderInvoice } from "./hooks/useOrderInvoice";
import { useOrderReturn } from "./hooks/useOrderReturn";
import { Order } from "./types";

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const { loading: invoiceLoading, openInvoice } = useOrderInvoice(order.id);
  const { requestReturn } = useOrderReturn(order.id);

  const handleNotImplemented = () =>
    toast.info("Bu ozellik yakinda eklenecektir.");

  return (
    <>
      <OrderDetailModal
        order={order}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
      <OrderTrackingModal
        order={order}
        isOpen={trackingOpen}
        onClose={() => setTrackingOpen(false)}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-stone-200 rounded-xl overflow-hidden mb-6 hover:shadow-md transition-shadow duration-300"
      >
        <div className="bg-stone-50/80 p-4 border-b border-stone-100 flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div>
              <span className="text-stone-400 text-xs block mb-0.5">
                Siparis Tarihi
              </span>
              <span className="font-medium text-stone-700">{order.date}</span>
            </div>
            <div>
              <span className="text-stone-400 text-xs block mb-0.5">
                Siparis Ozeti
              </span>
              <span className="font-medium text-stone-700">
                {order.items.length} Urun | {formatPrice(order.total)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-400 tracking-wider">
              #{order.orderNumber}
            </span>
            <InvoiceButton loading={invoiceLoading} onClick={openInvoice} />
          </div>
        </div>

        <div className="p-6">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4 sm:hidden">
              <Badge className="bg-stone-900">{order.status}</Badge>
            </div>
            <OrderStatusStepper
              currentStep={order.stepIndex}
              status={order.statusCode}
            />
          </div>

          <OrderItemsList
            orderId={order.id}
            items={order.items}
            showReviewButton={order.statusCode === "delivered"}
            onReviewClick={handleNotImplemented}
          />

          <Separator className="my-6" />

          <OrderPaymentSummary
            compact
            subtotal={order.subtotal}
            discountAmount={order.discountAmount}
            shippingCost={order.shippingCost}
            total={order.total}
            paidAmount={order.paidAmount}
            remainingAmount={order.remainingAmount}
            paymentStatus={order.paymentStatus}
          />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex gap-8 text-sm text-stone-500">
              <div className="flex items-start gap-2 max-w-[200px]">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{order.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 flex-shrink-0" />
                <span>{order.paymentMethod}</span>
              </div>
            </div>

            <OrderActions
              order={order}
              onDetailClick={() => setDetailOpen(true)}
              onTrackingClick={() => setTrackingOpen(true)}
              onReturnClick={requestReturn}
              onNotImplementedClick={handleNotImplemented}
            />
          </div>
        </div>
      </motion.div>
    </>
  );
}
