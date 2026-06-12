import { formatPrice } from "@/lib/utils";

import { ProductCardProduct } from "./types";

type ProductInfoProps = {
  product: ProductCardProduct;
  isSale: boolean;
};

export function ProductInfo({ product, isSale }: ProductInfoProps) {
  return (
    <div className="text-left">
      <h3 className="mb-1 line-clamp-1 cursor-pointer text-base font-medium text-stone-800 transition-colors group-hover:text-rose-600">
        {product.name}
      </h3>
      <div className="flex items-center gap-2">
        {isSale && (
          <span className="text-sm text-stone-400 line-through">
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
  );
}
