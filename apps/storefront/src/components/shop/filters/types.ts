import { Product } from "@/lib/api";

export type Filters = {
  sizes: string[];
  colors: string[];
  priceRange: [number, number];
};

export type FilterAttributes = {
  sizes: string[];
  colors: Array<{ name: string; value: string }>;
  priceRange: [number, number];
};

export type FilterOverrides = Partial<Filters>;

export type ProductVariantLike = NonNullable<Product["variants"]>[number] &
  Record<string, unknown>;

export const DEFAULT_PRICE_RANGE: [number, number] = [0, 5000];
