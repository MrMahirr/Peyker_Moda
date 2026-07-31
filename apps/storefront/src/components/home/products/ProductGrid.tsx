import ProductCard from "@/components/shared/ProductCard";

import { ProductSectionProduct } from "./types";

type ProductGridProps = {
  products: ProductSectionProduct[];
};

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
