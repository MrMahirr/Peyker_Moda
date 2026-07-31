import { FavoriteResponse } from "@/lib/api";

export const mapFavoritesToIds = (favorites: FavoriteResponse[]) =>
  favorites.map((favorite) => String(favorite.id));

export const addFavoriteId = (favorites: string[], id: string) => {
  if (favorites.includes(id)) return favorites;
  return [...favorites, id];
};

export const removeFavoriteId = (favorites: string[], id: string) =>
  favorites.filter((favoriteId) => favoriteId !== id);
