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
  // Order.barcodeValue: orderNumber'ın görünen formatından (PM-YYYYMMDD-NNNNN)
  // BİLİNÇLİ OLARAK BAĞIMSIZ, kısa ve sadece rakam olan ayrı bir alan (bkz.
  // api/helpers.util.ts generateOrderBarcodeValue). "Fiş No:" satırı ve admin
  // panelindeki sipariş numarası hep receiptNo'yu gösterir; barkod ise BUNU
  // kodlar — böylece hem numara her yerde okunaklı/tam haliyle görünür hem
  // barkod 58mm'lik termal kağıtta güvenilir taranır. Verilmezse (örn. eski
  // veri) receiptNo'ya düşer.
  barcodeValue?: string;
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
      barcodeValue,
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
    const encodedBarcodeValue = barcodeValue || receiptNo;

    // margin:0 kullanılıyordu — bu, tarayıcının barkodun başlangıcını/bitişini
    // ayırt etmesi için gereken "sessiz bölge"yi (quiet zone) tamamen
    // kaldırıyordu, bu da okunmama sebeplerinden biriydi.
    useEffect(() => {
      if (barcodeRef.current && encodedBarcodeValue) {
        try {
          JsBarcode(barcodeRef.current, encodedBarcodeValue, {
            format: "CODE128",
            lineColor: "#000",
            width: 1.4,
            height: 44,
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
    }, [encodedBarcodeValue]);

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
      // Fişin gerçek fiziksel yan genişliği 58mm — tüm ölçüler buna göre ayarlandı.
      <div
        ref={ref}
        className="w-[58mm] bg-white text-black font-mono leading-tight p-2 mx-auto"
        style={{ fontSize: "2.1mm" }}
      >
        {/* Header */}
        <div className="text-center mb-2">
          {showLogoResolved && (
            <div className="mx-auto mb-1 h-10 w-10 flex items-center justify-center overflow-hidden">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Store Logo"
                  className="w-full h-full object-contain grayscale"
                />
              ) : (
                <div
                  className="h-8 w-8 rounded-full border border-black/20 flex items-center justify-center"
                  style={{ fontSize: "1.6mm" }}
                >
                  LOGO
                </div>
              )}
            </div>
          )}
          <h1
            className="font-bold text-black uppercase tracking-wide"
            style={{ fontSize: "3mm" }}
          >
            {header}
          </h1>
          {addressLines.map((line) => (
            <p key={line} className="mt-1 font-medium">
              {line}
            </p>
          ))}
          <p className="font-medium">Tel: {phoneText}</p>
          <p className="font-medium">Mersis: 1234567890123456</p>
        </div>

        {/* Info Block */}
        <div className="border-b border-black border-dashed my-2"></div>
        <div className="space-y-1 font-medium">
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
              <div key={item.id} className="mb-1">
                <div
                  className="font-bold truncate"
                  style={{ fontSize: "2.3mm" }}
                >
                  {item.name}
                </div>
                <div className="flex justify-between pl-2 font-medium">
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
          <div
            className="flex justify-between font-bold"
            style={{ fontSize: "2.6mm" }}
          >
            <span>TOPLAM:</span>
            <span>
              {total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
            </span>
          </div>
          <div className="flex justify-between mt-1 font-medium">
            <span>KDV (%{rate}):</span>
            <span>{taxAmount.toFixed(2)} TL</span>
          </div>
        </div>

        {/* Payment Type */}
        <div className="border-t border-black border-dashed my-2 pt-2 font-medium">
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
        <div className="text-center mt-4 font-medium space-y-1">
          <p>{footer}</p>
          <p>Degisim icin fis ibrazi zorunludur.</p>
          <p>Kiyafetlerde iade yoktur.</p>
          {/* Barkod: doğal (bozulmamış) oranıyla ortalanıyor; max-width/
              max-height sadece taşarsa oranı KORUYARAK küçültür — zorla
              yatay/dikey esnetme (önceki preserveAspectRatio="none")
              çubukların birbirine yakınlaşıp yer yer birleşmesine
              ("iç içe geçme") yol açıyordu.
              -mx-2 + calc(100% + 1rem): sarmalayıcı, fişin kendi yan
              padding'ini (p-2 = 8px x2) iptal ederek kağıdın tüm 58mm'ine
              yayılıyor — barkoda sağdan/soldan daha fazla alan kalıyor.
              maxWidth %96 (tam %100 değil): yazıcının gerçek basılabilir
              genişliği kağıdın nominal 58mm'inden biraz dar kalabiliyor
              — bu küçük pay, yazıcının barkodu kendi tarafında yeniden
              ölçekleyip çubukları bulanıklaştırıp birleştirmesini önlüyor. */}
          <div
            className="mt-2 -mx-2 flex justify-center items-center bg-white"
            style={{ height: "16mm", width: "calc(100% + 1rem)" }}
          >
            <svg
              ref={barcodeRef}
              style={{ maxWidth: "96%", maxHeight: "100%" }}
            />
          </div>
        </div>
      </div>
    );
  },
);

Receipt.displayName = "Receipt";
