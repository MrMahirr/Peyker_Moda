import { ProductVariant } from "@/lib/api";

export interface ProductSectionProduct {
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

export interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: ProductSectionProduct[];
  bgColor?: string;
  isSale?: boolean;
  loading?: boolean;
}
