import Image from "next/image";
import { ShoppingBag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { ProductCardProduct } from "./types";
import { FavoriteButton } from "./FavoriteButton";

type ProductImageAreaProps = {
  product: ProductCardProduct;
  isSale: boolean;
  favorited: boolean;
  onFavoriteToggle: () => void;
  onAddToCart: () => void;
};

export function ProductImageArea({
  product,
  isSale,
  favorited,
  onFavoriteToggle,
  onAddToCart,
}: ProductImageAreaProps) {
  return (
    <div className="relative mb-4 aspect-[3/4] overflow-hidden rounded-md bg-stone-100">
      {product.tag && (
        <Badge
          className={`absolute left-3 top-3 z-20 rounded-sm shadow-sm ${
            isSale
              ? "bg-rose-600 text-white hover:bg-rose-700"
              : "bg-white text-stone-900 hover:bg-white"
          }`}
        >
          {product.tag}
        </Badge>
      )}

      <FavoriteButton favorited={favorited} onToggle={onFavoriteToggle} />

      {product.image ? (
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-stone-400">
          Görsel Yok
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full bg-gradient-to-t from-black/50 to-transparent p-4 transition-transform duration-300 group-hover:translate-y-0">
        <Button
          className="w-full bg-white font-medium text-stone-900 shadow-md hover:bg-stone-100"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onAddToCart();
          }}
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          Sepete Ekle
        </Button>
      </div>
    </div>
  );
}
