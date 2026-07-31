import { ProductVariant } from "@/lib/api";

export interface ProductCardProduct {
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

export interface ProductCardProps {
  product: ProductCardProduct;
}
