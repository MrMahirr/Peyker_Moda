import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { OrderItem } from "./types";

interface OrderItemsListProps {
  orderId: string;
  items: OrderItem[];
  mode?: "card" | "detail";
  showReviewButton?: boolean;
  onReviewClick?: () => void;
}

export function OrderItemsList({
  orderId,
  items,
  mode = "card",
  showReviewButton = false,
  onReviewClick,
}: OrderItemsListProps) {
  if (mode === "detail") {
    return (
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={`detail-${orderId}-${item.id}`}
            className="flex gap-4 rounded-lg border border-stone-100 p-3"
          >
            <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-md bg-stone-100">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h5 className="line-clamp-1 font-medium text-stone-900">
                {item.name}
              </h5>
              <p className="mt-1 text-sm text-stone-500">
                Beden: {item.size} | Renk: {item.color}
              </p>
              <p className="mt-1 text-sm text-stone-500">
                Adet: {item.quantity}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-stone-900">
                {formatPrice(item.price * item.quantity)}
              </p>
              <p className="text-xs text-stone-400">
                {formatPrice(item.price)} / adet
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {items.map((item) => (
        <div key={`${orderId}-${item.id}`} className="flex gap-4 items-start">
          <div className="relative w-20 h-24 bg-stone-100 rounded-md overflow-hidden flex-shrink-0 border border-stone-100">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-serif font-bold text-stone-900 truncate">
              {item.name}
            </h4>
            <p className="text-sm text-stone-500 mt-1">
              Beden: {item.size} | Renk: {item.color}
            </p>
            <p className="text-sm font-medium text-amber-600 mt-1">
              {formatPrice(item.price)}
            </p>
          </div>
          {showReviewButton && (
            <Button
              variant="ghost"
              size="sm"
              className="text-stone-400 hover:text-stone-900 hidden sm:flex"
              onClick={onReviewClick}
            >
              Urunu Degerlendir
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
