import { useCallback, useEffect, useState } from "react";
import { storeApi } from "@/lib/api";
import { useFavorites } from "@/lib/FavoritesContext";
import { FavoriteItem } from "../types";

export function useFavoriteItems() {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { favorites: globalFavoriteIds } = useFavorites();

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await storeApi.getFavorites();
      setItems(data);
    } catch (caughtError) {
      const normalizedError =
        caughtError instanceof Error
          ? caughtError
          : new Error("Favoriler yuklenemedi");
      setError(normalizedError);
      console.error("Failed to fetch favorites:", caughtError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  useEffect(() => {
    setItems((currentItems) =>
      currentItems.filter((item) =>
        globalFavoriteIds.includes(String(item.id)),
      ),
    );
  }, [globalFavoriteIds]);

  const removeLocalFavorite = useCallback((id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }, []);

  return {
    items,
    loading,
    error,
    refetch: fetchFavorites,
    removeLocalFavorite,
  };
}
