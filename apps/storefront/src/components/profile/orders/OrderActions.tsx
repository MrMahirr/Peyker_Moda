import { Loader2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Order } from "./types";

interface OrderActionsProps {
  order: Order;
  onDetailClick: () => void;
  onTrackingClick: () => void;
  onReturnClick: () => void;
  onNotImplementedClick: () => void;
}

export function InvoiceButton({
  loading,
  onClick,
}: {
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 border-stone-200 text-stone-600"
      onClick={onClick}
      disabled={loading}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Fatura"}
    </Button>
  );
}

export function OrderActions({
  order,
  onDetailClick,
  onTrackingClick,
  onReturnClick,
  onNotImplementedClick,
}: OrderActionsProps) {
  const canRequestReturn =
    order.statusCode === "delivered" &&
    (order.returnInfo?.totalReturnableQuantity ?? 0) > 0;

  return (
    <div className="flex flex-wrap gap-3 w-full md:w-auto">
      {order.statusCode === "shipped" && (
        <Button
          className="flex-1 md:flex-none bg-stone-900 hover:bg-amber-600 text-white gap-2"
          onClick={onTrackingClick}
        >
          <Truck className="w-4 h-4" /> Kargo Takip
        </Button>
      )}
      {order.statusCode === "delivered" ? (
        <>
          <Button
            variant="outline"
            className="flex-1 md:flex-none border-stone-200"
            onClick={onDetailClick}
          >
            Siparis Detayi
          </Button>
          <Button
            variant="outline"
            className="flex-1 md:flex-none border-rose-200 text-rose-600"
            onClick={onReturnClick}
            disabled={!canRequestReturn}
          >
            {canRequestReturn ? "Iade Talebi" : "Iade Kapali"}
          </Button>
          <Button
            className="flex-1 md:flex-none bg-stone-900 text-white"
            onClick={onNotImplementedClick}
          >
            Tekrar Satin Al
          </Button>
        </>
      ) : (
        <Button
          variant="outline"
          className="flex-1 md:flex-none border-stone-200"
          onClick={onDetailClick}
        >
          Siparis Detayi
        </Button>
      )}
    </div>
  );
}
