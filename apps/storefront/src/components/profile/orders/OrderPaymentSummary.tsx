import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { getPaymentStatusLabel } from "./utils/orderLabels";

interface OrderPaymentSummaryProps {
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: string;
  compact?: boolean;
}

export function OrderPaymentSummary({
  subtotal,
  discountAmount,
  shippingCost,
  total,
  paidAmount,
  remainingAmount,
  paymentStatus,
  compact = false,
}: OrderPaymentSummaryProps) {
  if (compact) {
    return (
      <div className="mb-6 grid grid-cols-2 gap-3 rounded-lg border border-stone-100 bg-stone-50 p-4 text-sm md:grid-cols-3 lg:grid-cols-6">
        <SummaryMetric label="Ara Toplam" value={formatPrice(subtotal)} />
        <SummaryMetric
          label="Sepet Indirimi"
          value={`-${formatPrice(discountAmount)}`}
          valueClassName="text-rose-600"
        />
        <SummaryMetric label="Kargo" value={formatPrice(shippingCost)} />
        <SummaryMetric
          label="Siparis Toplami"
          value={formatPrice(total)}
          valueClassName="font-semibold text-stone-900"
        />
        <SummaryMetric
          label="Odenen Tutar"
          value={formatPrice(paidAmount)}
          valueClassName="font-semibold text-emerald-700"
        />
        <SummaryMetric
          label={getPaymentStatusLabel(paymentStatus)}
          value={
            remainingAmount > 0
              ? `${formatPrice(remainingAmount)} kalan`
              : "Borc yok"
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-2 text-sm">
      <SummaryRow label="Ara Toplam" value={formatPrice(subtotal)} />
      <SummaryRow
        label="Sepet Indirimi"
        value={`-${formatPrice(discountAmount)}`}
        className="text-rose-600"
      />
      <SummaryRow label="Kargo" value={formatPrice(shippingCost)} />
      <Separator />
      <SummaryRow
        label="Toplam"
        value={formatPrice(total)}
        className="font-semibold text-stone-900"
      />
      <SummaryRow
        label="Odenen"
        value={formatPrice(paidAmount)}
        className="text-emerald-700"
      />
      <SummaryRow
        label={getPaymentStatusLabel(paymentStatus)}
        value={remainingAmount > 0 ? formatPrice(remainingAmount) : "Borc yok"}
      />
    </div>
  );
}

function SummaryMetric({
  label,
  value,
  valueClassName = "text-stone-800",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div>
      <span className="block text-xs text-stone-400">{label}</span>
      <span className={`font-medium ${valueClassName}`}>{value}</span>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  className = "text-stone-600",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex justify-between ${className}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
