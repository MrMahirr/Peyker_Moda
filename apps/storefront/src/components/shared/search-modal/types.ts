import { Product } from "@/lib/api";

export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type SearchResultProduct = Product;
