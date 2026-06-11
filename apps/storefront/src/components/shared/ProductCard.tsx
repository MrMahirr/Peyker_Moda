"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductVariant } from "@/lib/api";
import { useCart } from "@/lib/CartContext";
import { useFavorites } from "@/lib/FavoritesContext";
import { fadeInUp, formatPrice } from "@/lib/utils";

interface ProductCardProduct {
  id: number | string;
  name: string;
  price: number;
  oldPrice?: number | null;
  image: string;
  tag?: string;
  slug?: string;
  stock?: number;
  variants?: ProductVariant[];
}

interface ProductCardProps {
  product: ProductCardProduct;
}

const getVariantSize = (variant: ProductVariant) =>
  variant.attributes?.size ||
  variant.attributes?.beden ||
  variant.attributes?.Beden ||
  variant.attributes?.Size ||
  (variant as unknown as { size?: string }).size ||
  "";

const getVariantColor = (variant: ProductVariant) =>
  variant.attributes?.color ||
  variant.attributes?.renk ||
  variant.attributes?.Renk ||
  variant.attributes?.Color ||
  (variant as unknown as { color?: string }).color ||
  "";

const uniqueValues = (values: string[]) =>
  Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  const isSale = product.oldPrice !== null && product.oldPrice !== undefined;
  const productSlug = product.slug || `product-${product.id}`;
  const favorited = isFavorite(String(product.id));
  const variants = useMemo(() => product.variants || [], [product.variants]);
  const inStockVariants = useMemo(
    () => variants.filter((variant) => Number(variant.stock || 0) > 0),
    [variants],
  );

  const availableSizes = useMemo(
    () => uniqueValues(variants.map(getVariantSize)),
    [variants],
  );
  const availableColors = useMemo(
    () => uniqueValues(variants.map(getVariantColor)),
    [variants],
  );

  const selectedVariant = useMemo(() => {
    if (variants.length === 0) return undefined;

    return variants.find((variant) => {
      const size = getVariantSize(variant);
      const color = getVariantColor(variant);
      const sizeMatches = availableSizes.length === 0 || size === selectedSize;
      const colorMatches =
        availableColors.length === 0 || color === selectedColor;
      return sizeMatches && colorMatches && Number(variant.stock || 0) > 0;
    });
  }, [
    availableColors.length,
    availableSizes.length,
    selectedColor,
    selectedSize,
    variants,
  ]);

  const currentPrice = selectedVariant?.price || product.price;
  const currentStock = selectedVariant
    ? Number(selectedVariant.stock || 0)
    : Number(product.stock ?? 999);
  const canAddToCart = variants.length === 0 || Boolean(selectedVariant);

  const openVariantPicker = () => {
    const firstAvailableVariant = inStockVariants[0] || variants[0];
    const firstSize = firstAvailableVariant
      ? getVariantSize(firstAvailableVariant)
      : "";
    const firstColor = firstAvailableVariant
      ? getVariantColor(firstAvailableVariant)
      : "";

    setSelectedSize(firstSize || availableSizes[0] || "");
    setSelectedColor(firstColor || availableColors[0] || "");
    setQuantity(1);
    openVariantPicker();
  };

  const isSizeAvailable = (size: string) =>
    variants.some((variant) => {
      const variantSize = getVariantSize(variant);
      const variantColor = getVariantColor(variant);
      const colorMatches =
        !selectedColor ||
        availableColors.length === 0 ||
        variantColor === selectedColor;
      return (
        variantSize === size && colorMatches && Number(variant.stock || 0) > 0
      );
    });

  const isColorAvailable = (color: string) =>
    variants.some((variant) => {
      const variantSize = getVariantSize(variant);
      const variantColor = getVariantColor(variant);
      const sizeMatches =
        !selectedSize ||
        availableSizes.length === 0 ||
        variantSize === selectedSize;
      return (
        variantColor === color && sizeMatches && Number(variant.stock || 0) > 0
      );
    });

  const addSelectedItemToCart = () => {
    const variantDescription = [selectedSize, selectedColor]
      .filter(Boolean)
      .join(" / ");
    const cartItemId = selectedVariant
      ? `${product.id}-${selectedVariant.id}`
      : String(product.id);

    if (variants.length > 0 && !selectedVariant) {
      toast.error("Sectiginiz beden ve renk kombinasyonu stokta yok.");
      return;
    }

    addItem({
      id: cartItemId,
      productId: String(product.id),
      variantId: selectedVariant?.id,
      name: product.name,
      price: currentPrice,
      image: product.image,
      variant: variantDescription || undefined,
      quantity,
    });
    setIsPickerOpen(false);
  };

  const handleAddToCart = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (variants.length === 0) {
      addSelectedItemToCart();
      return;
    }

    openVariantPicker();
  };

  const handleToggleFavorite = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    await toggleFavorite(String(product.id), product.name);
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{ fadeInUp }}
      className="group relative"
    >
      <Link href={`/urun/${productSlug}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 mb-4 rounded-md">
          {product.tag && (
            <Badge
              className={`absolute top-3 left-3 z-20 rounded-sm shadow-sm ${
                isSale
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "bg-white text-stone-900 hover:bg-white"
              }`}
            >
              {product.tag}
            </Badge>
          )}
          <button
            type="button"
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-20 hover:text-rose-500"
            onClick={handleToggleFavorite}
            aria-label="Favorilere ekle"
          >
            <Heart
              className={`w-5 h-5 ${favorited ? "fill-rose-500 text-rose-500" : ""}`}
            />
          </button>
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 bg-gradient-to-t from-black/50 to-transparent">
            <Button
              className="w-full bg-white text-stone-900 hover:bg-stone-100 shadow-md font-medium"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Sepete Ekle
            </Button>
          </div>
        </div>
        <div className="text-left">
          <h3 className="font-medium text-base mb-1 text-stone-800 group-hover:text-rose-600 transition-colors cursor-pointer line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            {isSale && (
              <span className="text-stone-400 line-through text-sm">
                {formatPrice(product.oldPrice!)}
              </span>
            )}
            <p
              className={`font-semibold ${isSale ? "text-rose-600" : "text-stone-900"}`}
            >
              {formatPrice(product.price)}
            </p>
          </div>
        </div>
      </Link>

      <AnimatePresence>
        {isPickerOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsPickerOpen(false)}
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
                  onClick={() => setIsPickerOpen(false)}
                  className="rounded-full p-2 text-stone-400 transition-colors hover:bg-white hover:text-stone-900"
                  aria-label="Modalı kapat"
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

                  {availableSizes.length > 0 && (
                    <div>
                      <div className="mb-2 text-sm font-semibold text-stone-800">
                        Beden
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {availableSizes.map((size) => {
                          const disabled = !isSizeAvailable(size);
                          return (
                            <button
                              key={size}
                              type="button"
                              disabled={disabled}
                              onClick={() => setSelectedSize(size)}
                              className={`min-w-11 rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
                                selectedSize === size
                                  ? "border-stone-900 bg-stone-900 text-white"
                                  : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                              } disabled:cursor-not-allowed disabled:opacity-40`}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {availableColors.length > 0 && (
                    <div>
                      <div className="mb-2 text-sm font-semibold text-stone-800">
                        Renk
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {availableColors.map((color) => {
                          const disabled = !isColorAvailable(color);
                          return (
                            <button
                              key={color}
                              type="button"
                              disabled={disabled}
                              onClick={() => setSelectedColor(color)}
                              className={`rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
                                selectedColor === color
                                  ? "border-stone-900 bg-stone-900 text-white"
                                  : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                              } disabled:cursor-not-allowed disabled:opacity-40`}
                            >
                              {color}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="mb-2 text-sm font-semibold text-stone-800">
                      Adet
                    </div>
                    <div className="flex w-fit items-center rounded-md border border-stone-200">
                      <button
                        type="button"
                        className="flex h-10 w-10 items-center justify-center text-stone-600 hover:bg-stone-50"
                        onClick={() =>
                          setQuantity((value) => Math.max(1, value - 1))
                        }
                        aria-label="Adedi azalt"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-stone-900">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        className="flex h-10 w-10 items-center justify-center text-stone-600 hover:bg-stone-50"
                        onClick={() =>
                          setQuantity((value) =>
                            Math.min(currentStock || 1, value + 1),
                          )
                        }
                        aria-label="Adedi arttır"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-stone-100 px-5 py-4 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  className="border-stone-200"
                  onClick={() => setIsPickerOpen(false)}
                >
                  Vazgec
                </Button>
                <Button
                  className="bg-stone-900 text-white hover:bg-amber-600"
                  onClick={addSelectedItemToCart}
                  disabled={!canAddToCart || currentStock <= 0}
                >
                  <ShoppingBag className="h-4 w-4" />
                  Sepete Ekle
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
