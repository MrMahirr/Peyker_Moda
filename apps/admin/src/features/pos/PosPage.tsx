import { useCallback, useEffect, useMemo, useState } from "react";
import { PosProductGrid } from "./components/ProductGrid";
import { PaymentModal } from "./components/PaymentModal";
import { ReturnExchangeModal } from "./components/ReturnExchangeModal";
import { Minus, Plus, RotateCcw, ShoppingCart, X, Banknote } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CashDrawer } from "./components/CashDrawer";
import { calculateTotals, CartItem, usePos } from "@/context/PosContext";
import { toast } from "sonner";
import { swal } from "@/utils/swal";
import { usePosHotkeys } from "./hooks/usePosHotkeys";
import { PosSession, posService } from "./services/pos.service";

export const PosPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, totals, addToCart } =
    usePos();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isCashDrawerOpen, setIsCashDrawerOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState<PosSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  const saleItems = useMemo(
    () =>
      cart.filter(
        (item) => item.lineType === "SALE" || item.lineType === "EXCHANGE",
      ),
    [cart],
  );
  const saleTotals = useMemo(() => calculateTotals(saleItems), [saleItems]);
  const hasReturnItems = useMemo(
    () => cart.some((item) => item.lineType === "RETURN"),
    [cart],
  );
  const hasSaleItems = saleItems.length > 0;
  const paymentDisabled = sessionLoading || !currentSession || !hasSaleItems;

  const paymentDisabledReason = useMemo(() => {
    if (sessionLoading) return "Kasa oturumu kontrol ediliyor.";
    if (!currentSession) return "Ödeme almak için açık kasa oturumu gerekli.";
    if (!hasSaleItems) return "Ödeme için en az bir satış satırı ekleyin.";
    return "";
  }, [currentSession, hasSaleItems, sessionLoading]);

  const loadCurrentSession = useCallback(async () => {
    setSessionLoading(true);
    try {
      const session = await posService.getCurrentSession();
      setCurrentSession(session);
    } catch (err) {
      console.error("POS session fetch failed:", err);
      setCurrentSession(null);
    } finally {
      setSessionLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCurrentSession();
  }, [loadCurrentSession]);

  const openPayment = useCallback(() => {
    if (paymentDisabled) {
      toast.warning(paymentDisabledReason, { className: "font-medium" });
      return;
    }
    setIsPaymentModalOpen(true);
  }, [paymentDisabled, paymentDisabledReason]);

  const handleQuantityChange = useCallback(
    (item: CartItem, nextQuantity: number) => {
      if (nextQuantity <= 0) {
        updateQuantity(item.id, nextQuantity);
        return;
      }

      if (
        item.lineType !== "RETURN" &&
        typeof item.stock === "number" &&
        nextQuantity > item.stock
      ) {
        toast.warning(`Stok sınırı: ${item.stock}`, {
          className: "font-medium",
        });
        return;
      }

      updateQuantity(item.id, nextQuantity);
    },
    [updateQuantity],
  );

  usePosHotkeys({
    onSearchFocus: () => {
      const searchInput = document.querySelector(
        'input[placeholder*="ara"]',
      ) as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        toast.info("Arama odaklandı (F2)", { className: "font-medium" });
      }
    },
    onPayment: openPayment,
    onBarcodeScanned: async (barcode) => {
      try {
        const product = await posService.getProductByBarcode(barcode);
        if (!product) {
          toast.error(`Barkod bulunamadı: ${barcode}`, {
            className: "font-medium",
          });
          return;
        }

        if (product.stock <= 0) {
          toast.error(`Stok yok: ${product.name}`, {
            className: "font-medium",
          });
          return;
        }

        const existingQuantity =
          cart.find(
            (item) => item.variantId === product.id && item.lineType === "SALE",
          )?.quantity ?? 0;
        if (existingQuantity >= product.stock) {
          toast.warning(`Stok sınırı: ${product.stock}`, {
            className: "font-medium",
          });
          return;
        }

        addToCart({
          id: product.id,
          variantId: product.id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          image: product.image,
        });
        toast.success(`Ürün eklendi: ${product.name}`, {
          className: "font-medium",
        });
      } catch (err) {
        console.error("Barcode lookup failed:", err);
        toast.error("Barkod sorgulanamadı. Bağlantıyı kontrol edin.", {
          className: "font-medium",
        });
      }
    },
  });

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-zinc-50">
      <div className="w-[70%] h-full">
        <PosProductGrid />
      </div>

      <div className="w-[30%] h-full bg-white flex flex-col border-l border-zinc-200/80 shadow-md z-20">
        <div className="p-4 border-b border-zinc-200/80 bg-zinc-50/50">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center shadow-sm">
                <ShoppingCart className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-zinc-900">
                  Sepet{" "}
                  <span className="text-zinc-500 font-medium ml-1">
                    ({cart.length})
                  </span>
                </h2>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold">
                  <span
                    className={
                      currentSession
                        ? "rounded bg-emerald-50 px-2 py-0.5 text-emerald-700"
                        : "rounded bg-rose-50 px-2 py-0.5 text-rose-700"
                    }
                  >
                    {sessionLoading
                      ? "Kasa kontrol ediliyor"
                      : currentSession
                        ? "Kasa açık"
                        : "Kasa kapalı"}
                  </span>
                  {hasReturnItems && (
                    <span className="rounded bg-amber-50 px-2 py-0.5 text-amber-700">
                      İade satırı var
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white border-zinc-200/80 hover:bg-zinc-50 text-zinc-700 font-medium"
                onClick={() => setIsCashDrawerOpen(true)}
              >
                <Banknote className="h-3.5 w-3.5 mr-1.5" />
                Kasa İşlemleri
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white border-zinc-200/80 hover:bg-zinc-50 text-zinc-700 font-medium"
                onClick={() => setIsReturnModalOpen(true)}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                İade/Değişim
              </Button>
              {cart.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => {
                    swal
                      .fire({
                        title: "Sepeti temizle?",
                        text: "Tüm ürünler sepetten çıkarılacak.",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonText: "Evet, temizle",
                        cancelButtonText: "Vazgeç",
                        customClass: {
                          confirmButton:
                            "bg-zinc-900 border-none hover:bg-zinc-800 text-white font-medium rounded-lg px-4 py-2",
                          cancelButton:
                            "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium rounded-lg px-4 py-2 mr-2",
                        },
                      })
                      .then((result) => {
                        if (result.isConfirmed) {
                          clearCart();
                          toast.info("Sepet temizlendi.", {
                            className: "font-medium",
                          });
                        }
                      });
                  }}
                >
                  Temizle
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/30">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4 border border-zinc-200/50">
                <ShoppingCart className="h-6 w-6 text-zinc-300" />
              </div>
              <p className="text-zinc-600 font-semibold mb-1">Sepetiniz boş.</p>
              <p className="text-sm text-zinc-400 font-medium max-w-[200px]">
                Ürün eklemek için sol taraftaki listeyi kullanın.
              </p>
            </div>
          ) : (
            cart.map((item) => {
              const isReturn = item.lineType === "RETURN";
              const isStockLimited =
                !isReturn && typeof item.stock === "number";
              const plusDisabled =
                isStockLimited && item.quantity >= (item.stock ?? 0);
              const lineTotal =
                item.price * item.quantity * (isReturn ? -1 : 1);

              return (
                <div
                  key={item.id}
                  className="flex gap-3 bg-white border border-zinc-200/60 rounded-xl p-3 shadow-sm hover:border-zinc-300 transition-colors group"
                >
                  <div className="flex-shrink-0">
                    <img
                      src={item.image || "/peyker-moda-kapak3.png"}
                      alt={item.name}
                      className="h-16 w-16 object-cover rounded-lg bg-zinc-50 border border-zinc-100"
                    />
                  </div>
                  <div className="flex-1 flex flex-col py-0.5 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h4 className="font-semibold text-zinc-900 text-[13px] leading-snug line-clamp-2 truncate">
                          {item.name}
                        </h4>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          {isReturn && (
                            <span className="inline-flex rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-600">
                              İade
                            </span>
                          )}
                          {isStockLimited && (
                            <span className="inline-flex rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500">
                              Stok: {item.stock}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-zinc-300 hover:text-red-500 transition-colors shrink-0 -mt-1 -mr-1 p-1.5"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-end justify-between mt-auto">
                      <div className="text-zinc-900 font-bold text-[15px]">
                        {lineTotal.toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        TL
                      </div>

                      <div className="flex items-center gap-1 bg-zinc-100/80 rounded-lg p-1 border border-zinc-200/50">
                        <button
                          type="button"
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-white shadow-sm border border-zinc-200/50 text-zinc-600 hover:text-zinc-900 disabled:opacity-50 transition-colors"
                          onClick={() =>
                            handleQuantityChange(item, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-[13px] font-bold text-zinc-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-white shadow-sm border border-zinc-200/50 text-zinc-600 hover:text-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          disabled={plusDisabled}
                          onClick={() =>
                            handleQuantityChange(item, item.quantity + 1)
                          }
                          title={
                            plusDisabled
                              ? `Stok sınırı: ${item.stock}`
                              : undefined
                          }
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-5 bg-white border-t border-zinc-200/80 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] z-10">
          <div className="space-y-3 mb-5">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-zinc-500">
                Ara Toplam
              </span>
              <span className="text-sm font-semibold text-zinc-700">
                {totals.subtotal.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                })}{" "}
                TL
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-zinc-500">
                KDV (%10)
              </span>
              <span className="text-sm font-semibold text-zinc-700">
                {totals.tax.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                })}{" "}
                TL
              </span>
            </div>
            {hasReturnItems && (
              <div className="flex justify-between items-center rounded-lg bg-amber-50 px-3 py-2">
                <span className="text-xs font-bold text-amber-700">
                  Ödeme satış toplamı
                </span>
                <span className="text-sm font-black text-amber-800">
                  {saleTotals.total.toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  TL
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t border-zinc-100">
              <span className="text-base font-bold text-zinc-900">
                GENEL TOPLAM
              </span>
              <span className="text-2xl font-black text-zinc-900 tracking-tight">
                {totals.total.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                })}{" "}
                TL
              </span>
            </div>
          </div>

          {paymentDisabledReason && (
            <p className="mb-2 text-center text-xs font-semibold text-zinc-500">
              {paymentDisabledReason}
            </p>
          )}
          <Button
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white h-14 text-base font-bold shadow-lg shadow-zinc-900/10 transition-all rounded-xl disabled:bg-zinc-300 disabled:shadow-none"
            disabled={paymentDisabled}
            onClick={openPayment}
          >
            ÖDEME AL
          </Button>
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        total={saleTotals.total}
      />
      <ReturnExchangeModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        hasCurrentSession={Boolean(currentSession)}
      />
      <Modal
        isOpen={isCashDrawerOpen}
        onClose={() => setIsCashDrawerOpen(false)}
        title="Kasa İşlemleri"
      >
        <CashDrawer onSessionChange={loadCurrentSession} />
      </Modal>
    </div>
  );
};
