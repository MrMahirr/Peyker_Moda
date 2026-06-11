import { Product } from "@/lib/api";

import {
  DEFAULT_PRICE_RANGE,
  FilterAttributes,
  ProductVariantLike,
} from "../types";

const getVariantValue = (variant: ProductVariantLike, keys: string[]) => {
  const attributes = variant.attributes as Record<string, unknown> | undefined;

  for (const key of keys) {
    const value = attributes?.[key] ?? variant[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
};

export const buildAttributesFromProducts = (
  products: Product[],
): FilterAttributes => {
  const sizes = new Set<string>();
  const colors = new Set<string>();
  let maxPrice = 0;

  products.forEach((product) => {
    const price = Number(product.price || 0);
    if (Number.isFinite(price)) {
      maxPrice = Math.max(maxPrice, price);
    }

    product.variants?.forEach((variant) => {
      const variantLike = variant as ProductVariantLike;
      const size = getVariantValue(variantLike, [
        "size",
        "beden",
        "Beden",
        "Size",
      ]);
      const color = getVariantValue(variantLike, [
        "color",
        "renk",
        "Renk",
        "Color",
      ]);

      if (size) sizes.add(size);
      if (color) colors.add(color);
    });
  });

  const priceMax =
    maxPrice > 0 ? Math.ceil(maxPrice / 100) * 100 : DEFAULT_PRICE_RANGE[1];

  return {
    sizes: Array.from(sizes).sort(),
    colors: Array.from(colors)
      .sort()
      .map((color) => ({ name: color, value: color })),
    priceRange: [0, priceMax],
  };
};
