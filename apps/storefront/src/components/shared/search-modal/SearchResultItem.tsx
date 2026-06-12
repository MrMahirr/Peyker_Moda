import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { formatPrice, resolveProductImages } from "@/lib/utils";

import { SearchResultProduct } from "./types";

type SearchResultItemProps = {
  product: SearchResultProduct;
  onClick: () => void;
};

export function SearchResultItem({ product, onClick }: SearchResultItemProps) {
  return (
    <Link
      href={`/urun/${product.slug}`}
      onClick={onClick}
      className="group flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-stone-50"
    >
      <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100">
        <Image
          src={resolveProductImages(product.images)[0] || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase text-stone-500">
          {product.category?.name || "Giyim"}
        </p>
        <h4 className="truncate font-medium text-stone-900 transition-colors group-hover:text-amber-600">
          {product.name}
        </h4>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-semibold text-stone-900">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-sm text-stone-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
      <ArrowRight className="h-5 w-5 text-stone-300 transition-colors group-hover:text-amber-600" />
    </Link>
  );
}
