import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

import { ProductCardProduct } from "./types";
import { QuantitySelector } from "./QuantitySelector";
import { VariantOptionGroup } from "./VariantOptionGroup";

type VariantPickerModalProps = {
  product: ProductCardProduct;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  availableSizes: string[];
  availableColors: string[];
  currentPrice: number;
  currentStock: number;
  canAddToCart: boolean;
  onClose: () => void;
  onSizeSelect: (size: string) => void;
  onColorSelect: (color: string) => void;
  isSizeAvailable: (size: string) => boolean;
  isColorAvailable: (color: string) => boolean;
  onDecreaseQuantity: () => void;
  onIncreaseQuantity: () => void;
  onAddToCart: () => void;
};

export function VariantPickerModal({
  product,
  selectedSize,
  selectedColor,
  quantity,
  availableSizes,
  availableColors,
  currentPrice,
  currentStock,
  canAddToCart,
  onClose,
  onSizeSelect,
  onColorSelect,
  isSizeAvailable,
  isColorAvailable,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onAddToCart,
}: VariantPickerModalProps) {
  return (
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
        aria-labelledby={`variant-picker-${product.id}`}
        className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-stone-100 bg-stone-50 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
              Secenekleri Belirle
            </p>
            <h3
              id={`variant-picker-${product.id}`}
              className="mt-1 font-serif text-xl font-bold text-stone-900"
            >
              {product.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 transition-colors hover:bg-white hover:text-stone-900"
            aria-label="Modali kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-[120px_1fr]">
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-stone-100">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-stone-900">
                  {formatPrice(currentPrice)}
                </span>
                {product.oldPrice && (
                  <span className="text-sm text-stone-400 line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs font-medium text-stone-500">
                {currentStock > 0
                  ? `${currentStock} adet stokta`
                  : "Stokta yok"}
              </p>
            </div>

            <VariantOptionGroup
              label="Beden"
              options={availableSizes}
              selectedValue={selectedSize}
              isAvailable={isSizeAvailable}
              onSelect={onSizeSelect}
            />

            <VariantOptionGroup
              label="Renk"
              options={availableColors}
              selectedValue={selectedColor}
              isAvailable={isColorAvailable}
              onSelect={onColorSelect}
            />

            <QuantitySelector
              quantity={quantity}
              onDecrease={onDecreaseQuantity}
              onIncrease={onIncreaseQuantity}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-stone-100 px-5 py-4 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            className="border-stone-200"
            onClick={onClose}
          >
            Vazgec
          </Button>
          <Button
            className="bg-stone-900 text-white hover:bg-amber-600"
            onClick={onAddToCart}
            disabled={!canAddToCart || currentStock <= 0}
          >
            <ShoppingBag className="h-4 w-4" />
            Sepete Ekle
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
