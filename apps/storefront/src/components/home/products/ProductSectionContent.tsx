import { ProductGrid } from "./ProductGrid";
import { ProductSectionEmpty } from "./ProductSectionEmpty";
import { ProductSectionLoading } from "./ProductSectionLoading";
import { ProductSectionProduct } from "./types";

type ProductSectionContentProps = {
  products: ProductSectionProduct[];
  loading: boolean;
};

export function ProductSectionContent({
  products,
  loading,
}: ProductSectionContentProps) {
  if (loading) {
    return <ProductSectionLoading />;
  }

  if (products.length === 0) {
    return <ProductSectionEmpty />;
  }

  return <ProductGrid products={products} />;
}
