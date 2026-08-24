import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import {
  CreditCard,
  Wallet,
  Banknote,
  CheckCircle2,
  Printer,
  ArrowRight,
} from "lucide-react";
import { CartItem, usePos } from "@/context/PosContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Receipt } from "@/components/shared/Receipt";
import {
  PaymentMethod as ApiPaymentMethod,
  posService,
} from "../services/pos.service";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import {
  settingsService,
  StoreSettings,
} from "@/features/settings/services/settings.service";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
}

type PaymentMethod = "cash" | "credit_card" | "iban";

export const PaymentModal = ({ isOpen, onClose, total }: PaymentModalProps) => {
  const { cart, clearCart } = usePos();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [receivedAmount, setReceivedAmount] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [receiptSettings, setReceiptSettings] = useState<StoreSettings | null>(
    null,
  );

  // Store a snapshot of payable sale lines for the receipt.
  const [receiptCart, setReceiptCart] = useState<CartItem[]>([]);
  const [receiptNo, setReceiptNo] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReceivedAmount("");
      setIsSuccess(false);
      setProcessing(false);
      setPaymentMethod("cash");
      setReceiptCart(
        cart.filter(
          (item) => item.lineType === "SALE" || item.lineType === "EXCHANGE",
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    let isMounted = true;

    const loadReceiptSettings = async () => {
      if (!isOpen) return;
      try {
        const data = await settingsService.getSettings();
        if (isMounted) {
          setReceiptSettings(data);
        }
      } catch (err) {
        console.error("Receipt settings fetch error:", err);
        if (isMounted) {
          setReceiptSettings(null);
        }
      }
    };

    loadReceiptSettings();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleComplete = async () => {
    setProcessing(true);

    try {
      const saleItems = cart.filter(
        (item) => item.lineType === "SALE" || item.lineType === "EXCHANGE",
      );
      if (saleItems.length === 0) {
        toast.error("Satisa uygun sepet satiri bulunmuyor.", {
          className: "font-medium",
        });
        return;
      }

      if (
        paymentMethod === "cash" &&
        receivedAmount &&
        Number(receivedAmount) < total
      ) {
        toast.error("Alınan tutar ödenecek tutardan düşük.", {
          className: "font-medium",
        });
        return;
      }

      const apiPaymentMethod =
        paymentMethod === "cash"
          ? "CASH"
          : paymentMethod === "credit_card"
            ? "CREDIT_CARD"
            : ("BANK_TRANSFER" as ApiPaymentMethod);

      // Map cart items to API format
      const saleData = {
        items: saleItems.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
        })),
        payments: [
          {
            method: apiPaymentMethod,
            amount:
              paymentMethod === "cash"
                ? Number(receivedAmount) || total
                : total,
          },
        ],
        notes: `POS Odeme - ${new Date().toLocaleString("tr-TR")}`,
      };

      const result = await posService.createSale(saleData);

      setIsSuccess(true);
      const orderNo =
        result.receipt?.orderNumber ||
        result.order?.orderNumber ||
        `TR-${Math.floor(Math.random() * 100000)}`;
      setReceiptNo(orderNo);
      setReceiptCart(saleItems);

      toast.success(`Ödeme Başarılı: ${total.toLocaleString("tr-TR")} ₺`, {
        className: "font-medium py-3 px-4 shadow-xl",
      });
      clearCart();
    } catch (error) {
      console.error("Sale creation failed:", error);
      toast.error("Satış kaydedilemedi. Lütfen ağ bağlantısını kontrol edin.", {
        className: "font-medium",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    onClose();
  };

  const change = Math.max(0, Number(receivedAmount) - total);

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
        <div className="w-full max-w-lg h-[90vh] sm:h-auto max-h-[90vh] flex flex-col bg-zinc-100 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-white/20 print-reset">
          {/* Success Header */}
          <div className="bg-white p-8 text-center shrink-0 shadow-sm relative z-10">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-500 ring-4 ring-emerald-50/50">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">
              Ödeme Tamamlandı!
            </h2>
            <p className="text-[13px] font-medium text-zinc-500 mt-1 mb-6">
              Satış belgesi oluşturuldu ve kaydedildi.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="secondary"
                onClick={handlePrint}
                className="h-12 flex-1 font-bold text-[13px] bg-zinc-100 border-transparent hover:bg-zinc-200"
              >
                <Printer className="mr-2 h-4 w-4 text-zinc-500" />
                Fişi Gör/Yazdır
              </Button>
              <Button
                variant="primary"
                onClick={handleClose}
                className="h-12 flex-1 font-bold text-[13px] bg-zinc-900 hover:bg-zinc-800 text-white border-transparent"
              >
                Yeni Satış <ArrowRight className="ml-2 h-4 w-4 opacity-70" />
              </Button>
            </div>
          </div>

          {/* Receipt Preview Area (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-zinc-100/80 bg-blend-soft-light hide-scrollbar print-reset">
            {/*
              .print-reset (bkz. index.css @media print): bu sarmalayıcıdaki
              scale-95 dönüşümü ve overflow-hidden, global @media print kuralının
              #printable-receipt'e uyguladığı position:absolute için konteyner
              (containing block) oluşturup fişi bu kutunun (içerik olmadığı için
              0 yükseklikteki) sınırlarına kırpıyordu — "boş fiş" basılmasının
              asıl sebebi buydu. Not: Tailwind'in print: varyantı bu projedeki
              Tailwind v4 kurulumunda derlenmiyor (compiled CSS'te hiç yok),
              o yüzden düz CSS sınıfı kullanılıyor.
            */}
            <div className="shadow-2xl rounded-sm overflow-hidden pointer-events-none select-none origin-top transition-transform scale-95 border border-zinc-200/50 print-reset">
              <Receipt
                cart={receiptCart}
                total={total}
                paymentMethod={paymentMethod}
                date={new Date()}
                receiptNo={receiptNo}
                cashierName={
                  user ? `${user.firstName} ${user.lastName}` : "Kasiyer"
                }
                headerText={receiptSettings?.receiptHeader}
                address={receiptSettings?.receiptAddress}
                phone={receiptSettings?.receiptPhone}
                footerText={receiptSettings?.receiptFooter}
                taxRate={receiptSettings?.receiptTaxRate}
                showLogo={receiptSettings?.receiptShowLogo}
                logoUrl={receiptSettings?.storeLogo}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ödeme İşlemi"
      size="lg"
      className="p-0 overflow-hidden"
    >
      <div className="flex flex-col md:flex-row h-[560px] max-h-[85vh] bg-white">
        {/* Left: Payment Methods */}
        <div className="w-full md:w-[32%] border-r border-zinc-200/80 bg-zinc-50/50 p-5 space-y-2">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">
            Ödeme Yöntemi
          </p>

          <button
            onClick={() => setPaymentMethod("cash")}
            className={cn(
              "w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[14px] font-bold transition-all duration-200",
              paymentMethod === "cash"
                ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 translate-x-1"
                : "bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
            )}
          >
            <Banknote
              className={cn(
                "h-5 w-5",
                paymentMethod === "cash" ? "text-emerald-400" : "text-zinc-400",
              )}
            />
            Nakit Tahsilat
          </button>

          <button
            onClick={() => setPaymentMethod("credit_card")}
            className={cn(
              "w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[14px] font-bold transition-all duration-200",
              paymentMethod === "credit_card"
                ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 translate-x-1"
                : "bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
            )}
          >
            <CreditCard
              className={cn(
                "h-5 w-5",
                paymentMethod === "credit_card"
                  ? "text-indigo-400"
                  : "text-zinc-400",
              )}
            />
            Kredi Kartı
          </button>

          <button
            onClick={() => setPaymentMethod("iban")}
            className={cn(
              "w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[14px] font-bold transition-all duration-200",
              paymentMethod === "iban"
                ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 translate-x-1"
                : "bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
            )}
          >
            <Wallet
              className={cn(
                "h-5 w-5",
                paymentMethod === "iban" ? "text-amber-400" : "text-zinc-400",
              )}
            />
            Havale / EFT
          </button>
        </div>

        {/* Right: Payment Details */}
        <div className="flex-1 p-8 flex flex-col bg-white overflow-y-auto">
          <div className="mb-8 p-6 bg-zinc-50 border border-zinc-200/50 rounded-2xl text-center shadow-sm">
            <p className="text-[13px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5">
              Ödenecek Tutar
            </p>
            <div className="text-[40px] leading-none font-black text-zinc-900 tracking-tight">
              {total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
            </div>
          </div>

          <div className="flex-1">
            {paymentMethod === "cash" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    Müşteriden Alınan Tutar
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full text-2xl font-bold p-4 bg-white border-2 border-zinc-200 rounded-xl focus:border-zinc-900 focus:ring-0 transition-colors pr-12"
                      placeholder="0.00"
                      value={receivedAmount}
                      onChange={(e) => setReceivedAmount(e.target.value)}
                      autoFocus
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-zinc-400 pointer-events-none">
                      ₺
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {[10, 20, 50, 100, 200].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setReceivedAmount(amount.toString())}
                      className="py-3 px-1 bg-zinc-50 border border-zinc-200/80 rounded-lg text-[15px] font-bold text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300 transition-all shadow-sm active:scale-95"
                    >
                      {amount}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setReceivedAmount(total.toFixed(2))}
                  className="w-full py-3 bg-zinc-900 text-white border border-transparent rounded-lg text-[14px] font-bold shadow-md hover:bg-zinc-800 transition-all active:scale-[0.98]"
                >
                  Tam Tutar Alındı
                </button>

                <div className="p-5 mt-4 bg-zinc-50 border border-zinc-200/80 rounded-2xl flex justify-between items-center shadow-inner">
                  <span className="font-semibold text-zinc-500 tracking-wide text-sm">
                    Para Üstü
                  </span>
                  <span
                    className={cn(
                      "font-black text-2xl tracking-tight transition-colors",
                      change > 0 ? "text-emerald-500" : "text-zinc-300",
                    )}
                  >
                    {change.toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    ₺
                  </span>
                </div>
              </div>
            )}

            {paymentMethod === "credit_card" && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="relative">
                  <div className="w-24 h-24 bg-zinc-50 border border-zinc-200/50 rounded-full flex items-center justify-center animate-pulse shadow-inner relative z-10">
                    <CreditCard className="h-10 w-10 text-zinc-400" />
                  </div>
                  <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-xl scale-150 animate-pulse delay-150"></div>
                </div>
                <div>
                  <p className="text-xl font-bold text-zinc-900 mb-2">
                    POS Cihazından İşlem Bekleniyor
                  </p>
                  <p className="text-[15px] font-medium text-zinc-500">
                    Lütfen temassız veya çip ile kartı okutunuz.
                  </p>
                </div>
              </div>
            )}

            {paymentMethod === "iban" && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-zinc-50 border border-zinc-200/50 rounded-2xl flex items-center justify-center shadow-sm -rotate-6">
                  <Wallet className="h-10 w-10 text-amber-500 rotate-6" />
                </div>
                <div>
                  <p className="text-xl font-bold text-zinc-900 mb-2">
                    Banka Hesabına Havale
                  </p>
                  <p className="text-[14px] font-medium text-zinc-500 max-w-sm mx-auto">
                    Müşterinin belirttiğiniz tutarı hesaplarınıza gönderdiğini
                    doğruladıktan sonra ödemeyi tamamlayın.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-4">
            <Button
              size="lg"
              className="w-full bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500 text-white h-14 text-lg font-black tracking-wide shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all rounded-xl"
              onClick={handleComplete}
              loading={processing}
            >
              ÖDEMEYİ TAMAMLA
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
