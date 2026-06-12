"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { storeApi } from "@/lib/api";

import { hasFavoriteAccess } from "./favorites/auth";
import {
  addFavoriteId,
  mapFavoritesToIds,
  removeFavoriteId,
} from "./favorites/favoriteIds";
import { favoriteMessages } from "./favorites/messages";
import { FavoritesContextValue } from "./favorites/types";

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined,
);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initFavorites = async () => {
      if (!hasFavoriteAccess()) {
        setLoading(false);
        return;
      }

      try {
        const favoriteProducts = await storeApi.getFavorites();
        setFavorites(mapFavoritesToIds(favoriteProducts));
      } catch (error) {
        console.error("Failed to fetch favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    initFavorites();
  }, []);

  const toggleFavorite = useCallback(
    async (id: string, name?: string) => {
      if (!hasFavoriteAccess()) {
        favoriteMessages.loginRequired();
        return;
      }

      const currentlyFavorite = favorites.includes(id);

      if (currentlyFavorite) {
        const success = await storeApi.removeFavorite(id);
        if (success) {
          setFavorites((currentFavorites) =>
            removeFavoriteId(currentFavorites, id),
          );
          favoriteMessages.removed(name);
          return;
        }

        favoriteMessages.removeFailed();
        return;
      }

      const success = await storeApi.addFavorite(id);
      if (success) {
        setFavorites((currentFavorites) => addFavoriteId(currentFavorites, id));
        favoriteMessages.added(name);
        return;
      }

      favoriteMessages.addFailed();
    },
    [favorites],
  );

  const isFavorite = useCallback(
    (id: string) => favorites.includes(String(id)),
    [favorites],
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      toggleFavorite,
      isFavorite,
      loading,
    }),
    [favorites, isFavorite, loading, toggleFavorite],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context)
    throw new Error("useFavorites must be used within FavoritesProvider");
  return context;
};
