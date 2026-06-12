export interface FavoritesContextValue {
  favorites: string[];
  toggleFavorite: (id: string, name?: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
  loading: boolean;
}
