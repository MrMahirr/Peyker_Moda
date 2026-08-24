import { forwardRef, useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

// PosContext'teki CartItem bu şekli sağlar (yapısal olarak uyumludur);
// bileşen paylaşılan olduğu için POS context'ine bağımlı olmamalı.
export type ReceiptLineType = "SALE" | "RETURN" | "EXCHANGE";

export interface ReceiptLineItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  lineType: ReceiptLineType;
}

interface ReceiptProps {
  cart: ReceiptLineItem[];
  total: number;
  paymentMethod: string;
  date: Date;
  receiptNo: string;
  cashierName: string;
  headerText?: string;
  address?: string;
  phone?: string;
  footerText?: string;
  taxRate?: number;
  showLogo?: boolean;
  logoUrl?: string;
}

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(
  (
    {
      cart,
      total,
      paymentMethod,
      date,
      receiptNo,
      cashierName,
      headerText,
      address,
      phone,
      footerText,
      taxRate,
      showLogo,
      logoUrl,
    },
    ref,
  ) => {
    const barcodeRef = useRef<SVGSVGElement>(null);

    // Fiş altındaki barkod: termal yazıcı/okuyucuların güvenilir okuduğu
    // CODE128 ile gerçek, taranabilir bir barkod (eski dekoratif çizgi deseni değil).
    // margin:0 kullanılıyordu — bu, tarayıcının barkodun başlangıcını/bitişini
    // ayırt etmesi için gereken "sessiz bölge"yi (quiet zone) tamamen
    // kaldırıyordu ve barkodun okunmamasının asıl sebebi buydu.
    useEffect(() => {
      if (barcodeRef.current && receiptNo) {
        try {
          JsBarcode(barcodeRef.current, receiptNo, {
            format: "CODE128",
            lineColor: "#000",
            width: 1.3,
            height: 38,
            displayValue: true,
            fontSize: 10,
            fontOptions: "bold",
            margin: 8,
            textMargin: 2,
            background: "transparent",
          });
        } catch (error) {
          console.error("Fiş barkodu render hatası:", error);
        }
      }
    }, [receiptNo]);

    const header = headerText || "PEYKER MODA";
    const addressLines = (
      address || "Bagdat Caddesi No: 123\nKadikoy / ISTANBUL"
    )
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const phoneText = phone || "(0216) 123 45 67";
    const footer = footerText || "*** IYI GUNLER DILERIZ ***";
    const rate = typeof taxRate === "number" ? taxRate : 10;
    const taxAmount = (total * rate) / 100;
    const showLogoResolved = showLogo ?? true;

    return (
      // Not: sabit min-height/box-shadow kasıtlı olarak yok — bu bileşen hem
      // ekran önizlemesinde hem de #print-root'a portallanan gerçek yazdırma
      // çıktısında kullanılıyor; ekrana özel görsel süslemeler (gölge, min
      // yükseklik) çağıran tarafın sarmalayıcısında olmalı, yoksa yazdırma
      // çıktısının boyu/boşluğu yanlış çıkar.
      // Not: text-stroke ile birlikte tüm satırları font-black/font-semibold
      // yapmak "silik" sorununu aşırı düzeltip yazıyı kalın/bulanık hale
      // getirdi. font-medium/font-bold dengesine geri çekildi, text-stroke
      // kaldırıldı (barkodun altındaki SVG metnine miras kalıp onu da
      // kalınlaştırıyordu).
      <div
        ref={ref}
        className="w-[80mm] bg-white text-black font-mono text-[12px] leading-tight p-2 mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-2">
          {showLogoResolved && (
            <div className="mx-auto mb-2 h-16 w-16 flex items-center justify-center overflow-hidden">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Store Logo"
                  className="w-full h-full object-contain grayscale"
                />
              ) : (
                <div className="h-10 w-10 rounded-full border border-black/20 flex items-center justify-center text-[8px]">
                  LOGO
                </div>
              )}
            </div>
          )}
          <h1 className="text-base font-bold text-black uppercase tracking-wider">
            {header}
          </h1>
          {addressLines.map((line) => (
            <p key={line} className="text-[10px] mt-1 font-medium">
              {line}
            </p>
          ))}
          <p className="text-[10px] font-medium">Tel: {phoneText}</p>
          <p className="text-[10px] font-medium">
            Mersis: 1234567890123456
          </p>
        </div>

        {/* Info Block */}
        <div className="border-b border-black border-dashed my-2"></div>
        <div className="space-y-1 text-[11px] font-medium">
          <div className="flex justify-between">
            <span>Tarih:</span>
            <span>
              {date.toLocaleDateString("tr-TR")}{" "}
              {date.toLocaleTimeString("tr-TR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Fis No:</span>
            <span>{receiptNo}</span>
          </div>
          <div className="flex justify-between">
            <span>Kasiyer:</span>
            <span>{cashierName}</span>
          </div>
        </div>
        <div className="border-b border-black border-dashed my-2"></div>

        {/* Items */}
        <div className="mb-2">
          {cart.map((item) => {
            const multiplier = item.lineType === "RETURN" ? -1 : 1;
            return (
              <div key={item.id} className="mb-1 text-[11px]">
                <div className="font-bold truncate">{item.name}</div>
                <div className="flex justify-between pl-2 text-[10px] font-medium">
                  <span>
                    {item.quantity} x {item.price.toFixed(2)}
                  </span>
                  <span>
                    {(item.price * item.quantity * multiplier).toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div className="border-t border-black border-dashed my-2 pt-2">
          <div className="flex justify-between text-sm font-bold">
            <span>TOPLAM:</span>
            <span>
              {total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
            </span>
          </div>
          <div className="flex justify-between text-[10px] mt-1 font-medium">
            <span>KDV (%{rate}):</span>
            <span>{taxAmount.toFixed(2)} TL</span>
          </div>
        </div>

        {/* Payment Type */}
        <div className="border-t border-black border-dashed my-2 pt-2 text-[11px] font-medium">
          <div className="flex justify-between uppercase">
            <span>Odeme Tipi:</span>
            <span>
              {paymentMethod === "cash"
                ? "Nakit"
                : paymentMethod === "credit_card"
                  ? "Kredi Karti"
                  : "Diger"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 text-[10px] font-medium space-y-1">
          <p>{footer}</p>
          <p>Degisim icin fis ibrazi zorunludur.</p>
          <p>Kiyafetlerde iade yoktur.</p>
          <div
            className="mt-2 flex justify-center items-center py-2 bg-white"
            style={{ height: "16mm" }}
          >
            <svg
              ref={barcodeRef}
              style={{ maxWidth: "92%", maxHeight: "100%" }}
            />
          </div>
        </div>
      </div>
    );
  },
);

Receipt.displayName = "Receipt";
