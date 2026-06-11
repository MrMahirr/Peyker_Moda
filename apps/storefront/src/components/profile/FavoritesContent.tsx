"use client";

import { motion } from "framer-motion";
import { EmptyFavoritesState } from "./favorites/EmptyFavoritesState";
import { FavoritesGrid } from "./favorites/FavoritesGrid";
import { FavoritesHeader } from "./favorites/FavoritesHeader";
import { FavoritesLoadingState } from "./favorites/FavoritesLoadingState";
import { useFavoriteActions } from "./favorites/hooks/useFavoriteActions";
import { useFavoriteItems } from "./favorites/hooks/useFavoriteItems";

export default function FavoritesContent() {
  const { items, loading, error, removeLocalFavorite } = useFavoriteItems();
  const { addToCart, removeFavorite } = useFavoriteActions({
    onRemoved: removeLocalFavorite,
  });

  if (loading) return <FavoritesLoadingState />;

  if (error) {
    return (
      <div className="rounded-xl border border-rose-100 bg-rose-50 p-6 text-center text-sm font-medium text-rose-700">
        Favoriler yuklenirken bir hata olustu.
      </div>
    );
  }

  if (items.length === 0) return <EmptyFavoritesState />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <FavoritesHeader count={items.length} />
      <FavoritesGrid
        items={items}
        onAddToCart={addToCart}
        onRemove={removeFavorite}
      />
    </motion.div>
  );
}
