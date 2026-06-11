interface FavoritesHeaderProps {
  count: number;
}

export function FavoritesHeader({ count }: FavoritesHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-serif font-bold text-stone-900">
        Favorilerim ({count})
      </h2>
    </div>
  );
}
