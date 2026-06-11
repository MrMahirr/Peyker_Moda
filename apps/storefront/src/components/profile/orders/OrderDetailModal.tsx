"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CreditCard, MapPin, Package, Truck, X } from "lucide-react";
import { ReactNode } from "react";
import { OrderItemsList } from "./OrderItemsList";
import { OrderPaymentSummary } from "./OrderPaymentSummary";
import { Order } from "./types";

interface OrderDetailModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailModal({
  order,
  isOpen,
  onClose,
}: OrderDetailModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`order-detail-${order.id}`}
            className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-stone-100 bg-stone-50 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase text-stone-400">
                  Siparis Detayi
                </p>
                <h3
                  id={`order-detail-${order.id}`}
                  className="mt-1 font-serif text-2xl font-bold text-stone-900"
                >
                  #{order.orderNumber}
                </h3>
                <p className="mt-1 text-sm text-stone-500">{order.date}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-stone-400 transition-colors hover:bg-white hover:text-stone-900"
                aria-label="Siparis detayini kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(90vh-96px)] overflow-y-auto p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <SummaryCard
                  label="Durum"
                  icon={<Package className="h-4 w-4 text-stone-500" />}
                >
                  {order.status}
                </SummaryCard>
                <SummaryCard
                  label="Odeme"
                  icon={<CreditCard className="h-4 w-4 text-stone-500" />}
                >
                  {order.paymentMethod}
                </SummaryCard>
                <SummaryCard
                  label="Kargo"
                  icon={<Truck className="h-4 w-4 text-stone-500" />}
                >
                  {order.cargoProvider || "Hazirlaniyor"}
                </SummaryCard>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
                <section>
                  <h4 className="mb-3 font-semibold text-stone-900">Urunler</h4>
                  <OrderItemsList
                    orderId={order.id}
                    items={order.items}
                    mode="detail"
                  />
                </section>

                <aside className="space-y-4">
                  <div className="rounded-lg border border-stone-100 p-4">
                    <h4 className="mb-3 font-semibold text-stone-900">
                      Odeme Ozeti
                    </h4>
                    <OrderPaymentSummary
                      subtotal={order.subtotal}
                      discountAmount={order.discountAmount}
                      shippingCost={order.shippingCost}
                      total={order.total}
                      paidAmount={order.paidAmount}
                      remainingAmount={order.remainingAmount}
                      paymentStatus={order.paymentStatus}
                    />
                  </div>

                  <div className="rounded-lg border border-stone-100 p-4">
                    <h4 className="mb-3 font-semibold text-stone-900">
                      Teslimat Adresi
                    </h4>
                    <div className="flex gap-2 text-sm text-stone-600">
                      <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>{order.address}</span>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SummaryCard({
  label,
  icon,
  children,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-stone-100 p-4">
      <span className="text-xs text-stone-400">{label}</span>
      <div className="mt-2 flex items-center gap-2">
        {icon}
        <span className="font-medium text-stone-900">{children}</span>
      </div>
    </div>
  );
}
