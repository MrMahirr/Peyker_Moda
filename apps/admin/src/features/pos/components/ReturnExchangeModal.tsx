import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Banknote,
  CreditCard,
  Loader2,
  Minus,
  Plus,
  RotateCcw,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { usePos } from "@/context/PosContext";
import { Modal } from "@/components/ui/Modal";
import { ordersService } from "@/features/sales/services/orders.service";
import { useAuth } from "@/context/AuthContext";
import { PaymentMethod, PosReturn, posService } from "../services/pos.service";
import { cn } from "@/lib/utils";

interface ReturnExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasCurrentSession: boolean;
}

type ReturnType = "REFUND" | "EXCHANGE";

interface OrderItem {
  id: string;
  variantId: string;
  quantity: number;
  unitPrice: number | string;
  total: number | string;
  variant?: {
    id?: string;
    size?: string | null;
    color?: string | null;
    product?: {
      name?: string;
    };
  };
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  customer?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
  items?: OrderItem[];
}

const returnReasons = [
  "Müşteri talebi",
  "Beden uymadı",
  "Renk/model değişimi",
  "Kusurlu ürün",
  "Yanlış ürün",
];

const returnTypeLabels: Record<ReturnType, string> = {
  REFUND: "Para iadesi",
  EXCHANGE: "Değişim",
};

const refundableStatuses = new Set(["COMPLETED", "DELIVERED", "RETURNED"]);

export const ReturnExchangeModal = ({
  isOpen,
  onClose,
  hasCurrentSession,
}: ReturnExchangeModalProps) => {
  const { addReturnItem } = usePos();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [foundOrder, setFoundOrder] = useState<OrderDetail | null>(null);
  const [existingReturns, setExistingReturns] = useState<PosReturn[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [returnType, setReturnType] = useState<ReturnType>("REFUND");
  const [returnReason, setReturnReason] = useState(returnReasons[0]);
  const [refundMethod, setRefundMethod] = useState<PaymentMethod>("CASH");
  const [reference, setReference] = useState("");
  const [selectedQuantities, setSelectedQuantities] = useState<
    Record<string, number>
  >({});
  const [itemReasons, setItemReasons] = useState<Record<string, string>>({});

  const normalizedRole = user?.role?.toLowerCase() || "";
  const canProcessRefund =
    normalizedRole === "admin" || normalizedRole === "manager";

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setFoundOrder(null);
      setExistingReturns([]);
      setLoading(false);
      setSubmitting(false);
      setReturnType("REFUND");
      setReturnReason(returnReasons[0]);
      setRefundMethod("CASH");
      setReference("");
      setSelectedQuantities({});
      setItemReasons({});
    }
  }, [isOpen]);

  const returnedByVariant = useMemo(() => {
    const map = new Map<string, number>();
    for (const ret of existingReturns) {
      if (ret.status === "REJECTED") continue;
      for (const item of ret.items || []) {
        map.set(item.variantId, (map.get(item.variantId) || 0) + item.quantity);
      }
    }
    return map;
  }, [existingReturns]);

  const getItemName = (item: OrderItem) => {
    const base = item.variant?.product?.name || "Ürün";
    const variantInfo = [item.variant?.size, item.variant?.color]
      .filter(Boolean)
      .join(" / ");
    return variantInfo ? `${base} (${variantInfo})` : base;
  };

  const getItemPrice = (item: OrderItem) => {
    const unitPrice = Number(item.unitPrice ?? 0);
    if (Number.isFinite(unitPrice) && unitPrice > 0) {
      return unitPrice;
    }
    const total = Number(item.total ?? 0);
    return total && item.quantity ? total / item.quantity : 0;
  };

  const getReturnableQuantity = (item: OrderItem) => {
    const returnedQuantity = returnedByVariant.get(item.variantId) || 0;
    return Math.max(0, item.quantity - returnedQuantity);
  };

  const selectedItems = useMemo(() => {
    return (foundOrder?.items || [])
      .map((item) => ({
        item,
        quantity: selectedQuantities[item.id] || 0,
        price: getItemPrice(item),
        reason: itemReasons[item.id] || returnReason,
      }))
      .filter((line) => line.quantity > 0);
  }, [foundOrder?.items, itemReasons, returnReason, selectedQuantities]);

  const selectedTotal = useMemo(
    () =>
      selectedItems.reduce((sum, line) => sum + line.quantity * line.price, 0),
    [selectedItems],
  );

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) {
      toast.error("Fiş numarası, barkod veya müşteri telefonu girin.", {
        className: "font-medium",
      });
      return;
    }

    setLoading(true);
    setFoundOrder(null);
    setExistingReturns([]);
    setSelectedQuantities({});
    setItemReasons({});

    try {
      const result = await ordersService.getAll({ search: query, limit: 5 });
      const orders = result.data || [];
      const order =
        orders.find((candidate) => candidate.orderNumber === query) ||
        orders[0];

      if (!order) {
        toast.error("Sipariş bulunamadı.", { className: "font-medium" });
        return;
      }

      const detail = await ordersService.getById(order.id);
      const returns = await posService.getReturns({
        orderNumber: detail.orderNumber,
        limit: 50,
      });

      setFoundOrder(detail as OrderDetail);
      setExistingReturns(returns);
    } catch (err) {
      console.error("Order return search error:", err);
      toast.error("Sipariş sorgulanamadı.", { className: "font-medium" });
    } finally {
      setLoading(false);
    }
  };

  const updateSelectedQuantity = (item: OrderItem, quantity: number) => {
    const maxQuantity = getReturnableQuantity(item);
    const nextQuantity = Math.max(0, Math.min(quantity, maxQuantity));
    setSelectedQuantities((current) => ({
      ...current,
      [item.id]: nextQuantity,
    }));
  };

  const addSelectedReturnsToCart = () => {
    for (const line of selectedItems) {
      for (let index = 0; index < line.quantity; index += 1) {
        addReturnItem({
          id: line.item.variantId || line.item.id,
          variantId: line.item.variantId || line.item.id,
          name: getItemName(line.item),
          price: line.price,
          sourceOrderId: foundOrder?.id,
          sourceOrderItemId: line.item.id,
          returnReason: line.reason,
        });
      }
    }
  };

  const handleConfirm = async () => {
    if (!foundOrder) return;

    if (!hasCurrentSession) {
      toast.error("POS iade/değişim için açık kasa oturumu gerekli.", {
        className: "font-medium",
      });
      return;
    }

    if (!refundableStatuses.has(foundOrder.status)) {
      toast.error(
        "Sadece tamamlanmış veya teslim edilmiş siparişlerde iade yapılabilir.",
        { className: "font-medium" },
      );
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("İade edilecek en az bir kalem seçin.", {
        className: "font-medium",
      });
      return;
    }

    if (returnType === "REFUND" && !canProcessRefund) {
      toast.error("Para iadesi için admin veya manager yetkisi gerekli.", {
        className: "font-medium",
      });
      return;
    }

    setSubmitting(true);
    try {
      const created = await posService.createReturn({
        orderId: foundOrder.id,
        reason: returnReason,
        notes: `POS ${returnTypeLabels[returnType]} işlemi`,
        items: selectedItems.map((line) => ({
          orderItemId: line.item.id,
          variantId: line.item.variantId,
          quantity: line.quantity,
          reason: line.reason,
        })),
      });

      const approved = await posService.approveReturn(
        created.id,
        `POS ${returnTypeLabels[returnType]} onayı`,
      );

      if (returnType === "REFUND") {
        await posService.refundReturn(approved.id, {
          method: refundMethod,
          amount: selectedTotal,
          reference: reference || undefined,
          notes: "POS para iadesi tamamlandı",
          restock: true,
        });
        toast.success("Para iadesi tamamlandı ve stok güncellendi.", {
          className: "font-medium",
        });
      } else {
        await posService.completeReturn(
          approved.id,
          "POS değişim iadesi tamamlandı",
        );
        addSelectedReturnsToCart();
        toast.success(
          "Değişim iadesi tamamlandı. Yeni ürünleri sepete ekleyin.",
          { className: "font-medium" },
        );
      }

      onClose();
    } catch (err) {
      console.error("POS return failed:", err);
      toast.error("İade işlemi tamamlanamadı.", { className: "font-medium" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="İade & Değişim İşlemleri"
      size="lg"
      className="p-0 overflow-hidden h-[700px] flex flex-col"
      bodyClassName="p-0 flex-1 flex flex-col overflow-hidden"
    >
      <div className="p-5 border-b border-zinc-200/80 bg-zinc-50/50 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Fiş no, barkod veya müşteri telefonu"
              className="pl-10 h-11 bg-white border-zinc-200/80"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button
            variant="primary"
            onClick={handleSearch}
            className="h-11 px-6"
            loading={loading}
          >
            Sorgula
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(["REFUND", "EXCHANGE"] as ReturnType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setReturnType(type)}
              className={cn(
                "rounded-lg border px-3 py-2 text-xs font-bold transition-colors",
                returnType === type
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50",
              )}
            >
              {returnTypeLabels[type]}
            </button>
          ))}
          <button
            type="button"
            disabled
            className="rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2 text-xs font-bold text-zinc-400"
          >
            Mağaza kredisi yakında
          </button>
          {!hasCurrentSession && (
            <span className="ml-auto rounded bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700">
              Kasa kapalı
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 bg-white">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-900" />
            <p className="text-zinc-500 text-sm font-medium mt-3">
              Sipariş aranıyor...
            </p>
          </div>
        ) : foundOrder ? (
          <div className="space-y-5">
            <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-200/80 shadow-sm">
              <div className="flex justify-between items-center mb-1 gap-3">
                <span className="text-[13px] font-medium text-zinc-500 uppercase tracking-widest">
                  Sipariş Özeti
                </span>
                <span className="text-[13px] font-semibold text-zinc-900 border border-zinc-200 bg-white px-2.5 py-1 rounded-md shadow-sm">
                  Fiş No: {foundOrder.orderNumber}
                </span>
              </div>
              <div className="text-xl font-bold text-zinc-900 mt-2">
                {foundOrder.customer
                  ? `${foundOrder.customer.firstName || ""} ${foundOrder.customer.lastName || ""}`.trim()
                  : "Müşteri"}
              </div>
              <div className="text-sm font-medium text-zinc-500 mt-1">
                {new Date(foundOrder.createdAt).toLocaleString("tr-TR")}
                {foundOrder.customer?.phone
                  ? ` · ${foundOrder.customer.phone}`
                  : ""}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="space-y-1.5 md:col-span-1">
                <span className="text-xs font-bold text-zinc-500 uppercase">
                  Genel sebep
                </span>
                <select
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                >
                  {returnReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </label>

              {returnType === "REFUND" && (
                <>
                  <label className="space-y-1.5">
                    <span className="text-xs font-bold text-zinc-500 uppercase">
                      İade yöntemi
                    </span>
                    <select
                      className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700"
                      value={refundMethod}
                      onChange={(e) =>
                        setRefundMethod(e.target.value as PaymentMethod)
                      }
                    >
                      <option value="CASH">Nakit</option>
                      <option value="CREDIT_CARD">Kredi kartı</option>
                      <option value="BANK_TRANSFER">Havale/EFT</option>
                      <option value="OTHER">Diğer</option>
                    </select>
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-xs font-bold text-zinc-500 uppercase">
                      Referans
                    </span>
                    <Input
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="Opsiyonel"
                      className="h-10"
                    />
                  </label>
                </>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-zinc-900 text-[15px] px-1">
                İade Edilebilir Kalemler
              </h3>
              {foundOrder.items?.map((item) => {
                const returnedQuantity =
                  returnedByVariant.get(item.variantId) || 0;
                const returnableQuantity = getReturnableQuantity(item);
                const selectedQuantity = selectedQuantities[item.id] || 0;

                return (
                  <div
                    key={item.id}
                    className="bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[14px] text-zinc-900 leading-snug">
                          {getItemName(item)}
                        </div>
                        <div className="text-zinc-900 font-bold text-[15px] mt-1">
                          {getItemPrice(item).toLocaleString("tr-TR", {
                            minimumFractionDigits: 2,
                          })}{" "}
                          TL
                        </div>
                        <div className="mt-1 text-xs font-semibold text-zinc-500">
                          Satılan: {item.quantity} · Önceki iade:{" "}
                          {returnedQuantity} · İade edilebilir:{" "}
                          {returnableQuantity}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-zinc-100/80 rounded-lg p-1 border border-zinc-200/50">
                        <button
                          type="button"
                          className="w-8 h-8 flex items-center justify-center rounded-md bg-white border border-zinc-200/60 text-zinc-600 disabled:opacity-40"
                          disabled={selectedQuantity <= 0}
                          onClick={() =>
                            updateSelectedQuantity(item, selectedQuantity - 1)
                          }
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-black text-zinc-900">
                          {selectedQuantity}
                        </span>
                        <button
                          type="button"
                          className="w-8 h-8 flex items-center justify-center rounded-md bg-white border border-zinc-200/60 text-zinc-600 disabled:opacity-40"
                          disabled={selectedQuantity >= returnableQuantity}
                          onClick={() =>
                            updateSelectedQuantity(item, selectedQuantity + 1)
                          }
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    {selectedQuantity > 0 && (
                      <div className="mt-3">
                        <Input
                          value={itemReasons[item.id] || ""}
                          onChange={(e) =>
                            setItemReasons((current) => ({
                              ...current,
                              [item.id]: e.target.value,
                            }))
                          }
                          placeholder="Kalem sebebi, boş bırakılırsa genel sebep kullanılır"
                          className="h-9 text-sm"
                        />
                      </div>
                    )}
                  </div>
                );
              }) || <p className="text-zinc-500">Ürün bilgisi yok</p>}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-zinc-50 border border-zinc-200/80 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <Search className="h-6 w-6 text-zinc-400" />
            </div>
            <h3 className="text-zinc-900 font-bold mb-1.5">
              Sipariş Bekleniyor
            </h3>
            <p className="text-zinc-500 text-sm font-medium max-w-xs">
              İade veya değişim işlemi için fiş numarası, barkod ya da müşteri
              telefonu ile sorgulayın.
            </p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-zinc-200/80 bg-zinc-50/50 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-zinc-500">
            Seçilen iade tutarı
          </div>
          <div className="flex items-center gap-2 text-xl font-black text-zinc-900">
            {returnType === "REFUND" ? (
              <Banknote className="h-5 w-5 text-emerald-500" />
            ) : (
              <CreditCard className="h-5 w-5 text-amber-500" />
            )}
            {selectedTotal.toLocaleString("tr-TR", {
              minimumFractionDigits: 2,
            })}{" "}
            TL
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={onClose}
            className="px-6 font-semibold bg-white border border-zinc-200/80 shadow-sm text-zinc-700"
          >
            Kapat
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            loading={submitting}
            disabled={
              !foundOrder || selectedItems.length === 0 || !hasCurrentSession
            }
            className="px-6 font-bold"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {returnType === "REFUND" ? "İadeyi Tamamla" : "Değişimi Başlat"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
