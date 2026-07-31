import { Loader2 } from "lucide-react";

import { SearchResultProduct } from "./types";
import { SearchResultItem } from "./SearchResultItem";

type SearchResultsProps = {
  query: string;
  results: SearchResultProduct[];
  loading: boolean;
  searched: boolean;
  onProductClick: () => void;
  onViewAll: () => void;
};

export function SearchResults({
  query,
  results,
  loading,
  searched,
  onProductClick,
  onViewAll,
}: SearchResultsProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
      </div>
    );
  }

  if (searched && results.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-stone-500">
          &quot;{query}&quot; icin sonuc bulunamadi
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="p-4">
      <div className="space-y-3">
        {results.map((product) => (
          <SearchResultItem
            key={product.id}
            product={product}
            onClick={onProductClick}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onViewAll}
        className="mt-4 w-full rounded-xl py-3 text-center font-medium text-amber-600 transition-colors hover:bg-amber-50"
      >
        Tum sonuclari gor ({results.length}+)
      </button>
    </div>
  );
}
