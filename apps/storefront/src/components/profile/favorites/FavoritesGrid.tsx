"use client";

import { FavoriteCard } from "./FavoriteCard";
import { FavoriteItem } from "./types";

interface FavoritesGridProps {
  items: FavoriteItem[];
  onAddToCart: (item: FavoriteItem) => void;
  onRemove: (item: FavoriteItem) => void;
}

export function FavoritesGrid({
  items,
  onAddToCart,
  onRemove,
}: FavoritesGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <FavoriteCard
          key={item.id}
          item={item}
          onAddToCart={onAddToCart}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
