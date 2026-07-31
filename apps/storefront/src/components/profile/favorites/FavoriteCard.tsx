"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateDiscount, formatPrice } from "@/lib/utils";
import { FavoriteItem } from "./types";

interface FavoriteCardProps {
  item: FavoriteItem;
  onAddToCart: (item: FavoriteItem) => void;
  onRemove: (item: FavoriteItem) => void;
}

export function FavoriteCard({
  item,
  onAddToCart,
  onRemove,
}: FavoriteCardProps) {
  const hasDiscount =
    item.compareAtPrice !== undefined && item.compareAtPrice > item.price;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-stone-100 group"
    >
      <Link href={`/urun/${item.slug}`}>
        <div className="relative aspect-[3/4] bg-stone-100">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {hasDiscount && (
            <span className="absolute top-3 left-3 bg-rose-500 text-white text-xs px-2 py-1 rounded">
              %{calculateDiscount(item.price, item.compareAtPrice!)} Indirim
            </span>
          )}
          {!item.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-stone-900 px-4 py-2 rounded-lg font-medium">
                Tukendi
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">
          {item.category}
        </p>
        <Link href={`/urun/${item.slug}`}>
          <h3 className="font-medium text-stone-900 mb-2 line-clamp-2 hover:text-amber-600 transition-colors">
            {item.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mb-4">
          <span className="font-semibold text-lg text-stone-900">
            {formatPrice(item.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-stone-400 line-through">
              {formatPrice(item.compareAtPrice!)}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1 bg-stone-900 hover:bg-amber-600 text-white"
            onClick={() => onAddToCart(item)}
            disabled={!item.inStock}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Sepete Ekle
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="border-stone-200 text-rose-500 hover:bg-rose-50 hover:border-rose-200"
            onClick={() => onRemove(item)}
            aria-label={`${item.name} favorilerden kaldir`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
