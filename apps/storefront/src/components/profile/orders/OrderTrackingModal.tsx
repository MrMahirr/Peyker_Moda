"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  Clipboard,
  Clock,
  ExternalLink,
  MapPin,
  Package,
  Truck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type TrackableOrderStatus =
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "pending";

export interface TrackableOrder {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  statusCode: TrackableOrderStatus;
  address: string;
  cargoProvider?: string;
  cargoTrackingCode?: string;
  cargoLink?: string;
}

interface OrderTrackingModalProps {
  order: TrackableOrder;
  isOpen: boolean;
  onClose: () => void;
}

const TRACKING_STEPS: Array<{
  key: TrackableOrderStatus;
  label: string;
  description: string;
}> = [
  {
    key: "processing",
    label: "Hazirlaniyor",
    description: "Siparisiniz kargoya hazirlaniyor.",
  },
  {
    key: "shipped",
    label: "Kargoda",
    description: "Paket kargo firmasina teslim edildi.",
  },
  {
    key: "delivered",
    label: "Teslim Edildi",
    description: "Siparis teslim edildi olarak gorunuyor.",
  },
];

const getTrackingUrl = (
  provider?: string,
  trackingCode?: string,
  cargoLink?: string,
) => {
  if (cargoLink) return cargoLink;
  if (!provider || !trackingCode) return undefined;

  const normalizedProvider = provider.toLocaleLowerCase("tr-TR");
  const encodedCode = encodeURIComponent(trackingCode);

  if (normalizedProvider.includes("aras")) {
    return `https://www.araskargo.com.tr/tr/online-islemler/kargo-takip?code=${encodedCode}`;
  }
  if (
    normalizedProvider.includes("yurtici") ||
    normalizedProvider.includes("yurtiçi")
  ) {
    return `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${encodedCode}`;
  }
  if (normalizedProvider.includes("mng")) {
    return `https://www.mngkargo.com.tr/gonderi-takip?code=${encodedCode}`;
  }
  if (normalizedProvider.includes("ptt")) {
    return `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${encodedCode}`;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(`${provider} kargo takip ${trackingCode}`)}`;
};

const getStepState = (
  step: TrackableOrderStatus,
  currentStatus: TrackableOrderStatus,
) => {
  const order = ["pending", "processing", "shipped", "delivered"];
  const stepIndex = order.indexOf(step);
  const currentIndex = order.indexOf(currentStatus);

  if (currentStatus === "cancelled") return "idle";
  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "current";
  return "idle";
};

export function OrderTrackingModal({
  order,
  isOpen,
  onClose,
}: OrderTrackingModalProps) {
  const trackingUrl = getTrackingUrl(
    order.cargoProvider,
    order.cargoTrackingCode,
    order.cargoLink,
  );

  const handleCopyTrackingCode = async () => {
    if (!order.cargoTrackingCode) return;

    try {
      await navigator.clipboard.writeText(order.cargoTrackingCode);
      toast.success("Takip numarasi kopyalandi");
    } catch {
      toast.error("Takip numarasi kopyalanamadi");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`order-tracking-${order.id}`}
            className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-stone-100 bg-stone-50 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                  Kargo Takip
                </p>
                <h3
                  id={`order-tracking-${order.id}`}
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
                aria-label="Kargo takip modalini kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(90vh-96px)] overflow-y-auto p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-stone-100 p-4">
                  <span className="text-xs text-stone-400">Kargo Firmasi</span>
                  <div className="mt-2 flex items-center gap-2">
                    <Truck className="h-4 w-4 text-stone-500" />
                    <span className="font-medium text-stone-900">
                      {order.cargoProvider || "Firma bilgisi yok"}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border border-stone-100 p-4 md:col-span-2">
                  <span className="text-xs text-stone-400">Takip Numarasi</span>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Package className="h-4 w-4 text-stone-500" />
                    <span className="font-mono font-semibold text-stone-900">
                      {order.cargoTrackingCode ||
                        "Takip numarasi henuz eklenmedi"}
                    </span>
                    {order.cargoTrackingCode && (
                      <button
                        type="button"
                        onClick={handleCopyTrackingCode}
                        className="rounded-md p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-900"
                        aria-label="Takip numarasini kopyala"
                      >
                        <Clipboard className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-stone-100 p-5">
                <h4 className="font-semibold text-stone-900">Gonderi Durumu</h4>
                <div className="mt-5 space-y-4">
                  {TRACKING_STEPS.map((step) => {
                    const state = getStepState(step.key, order.statusCode);
                    const isCompleted = state === "completed";
                    const isCurrent = state === "current";

                    return (
                      <div key={step.key} className="flex gap-3">
                        <div
                          className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border ${
                            isCompleted
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : isCurrent
                                ? "border-stone-900 bg-stone-900 text-white"
                                : "border-stone-200 bg-white text-stone-300"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p
                            className={`font-semibold ${
                              isCurrent || isCompleted
                                ? "text-stone-900"
                                : "text-stone-400"
                            }`}
                          >
                            {step.label}
                          </p>
                          <p className="text-sm text-stone-500">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-stone-100 p-5">
                <h4 className="mb-3 font-semibold text-stone-900">
                  Teslimat Adresi
                </h4>
                <div className="flex gap-2 text-sm text-stone-600">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{order.address}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-stone-100 px-6 py-4 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                className="border-stone-200"
                onClick={onClose}
              >
                Kapat
              </Button>
              <Button
                className="bg-stone-900 text-white hover:bg-amber-600"
                disabled={!trackingUrl}
                onClick={() =>
                  trackingUrl && window.open(trackingUrl, "_blank")
                }
              >
                <ExternalLink className="h-4 w-4" />
                Kargo Sitesinde Ac
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
