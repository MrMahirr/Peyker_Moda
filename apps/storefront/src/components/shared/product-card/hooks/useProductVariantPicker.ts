import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useCart } from "@/lib/CartContext";

import { ProductCardProduct } from "../types";
import {
  buildVariantDescription,
  getVariantColor,
  getVariantSize,
  uniqueValues,
} from "../utils/variantUtils";

type UseProductVariantPickerParams = {
  product: ProductCardProduct;
};

export const useProductVariantPicker = ({
  product,
}: UseProductVariantPickerParams) => {
  const { addItem } = useCart();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

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
    setIsPickerOpen(true);
  };

  const closeVariantPicker = () => {
    setIsPickerOpen(false);
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

  const decreaseQuantity = () => {
    setQuantity((value) => Math.max(1, value - 1));
  };

  const increaseQuantity = () => {
    setQuantity((value) => Math.min(currentStock || 1, value + 1));
  };

  const addSelectedItemToCart = () => {
    const variantDescription = buildVariantDescription(
      selectedSize,
      selectedColor,
    );
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
    closeVariantPicker();
  };

  const handleAddToCart = () => {
    if (variants.length === 0) {
      addSelectedItemToCart();
      return;
    }

    openVariantPicker();
  };

  return {
    isPickerOpen,
    selectedSize,
    selectedColor,
    quantity,
    variants,
    availableSizes,
    availableColors,
    selectedVariant,
    currentPrice,
    currentStock,
    canAddToCart,
    setSelectedSize,
    setSelectedColor,
    closeVariantPicker,
    isSizeAvailable,
    isColorAvailable,
    decreaseQuantity,
    increaseQuantity,
    addSelectedItemToCart,
    handleAddToCart,
  };
};
