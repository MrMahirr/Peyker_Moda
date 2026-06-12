const POPULAR_SEARCHES = [
  "elbise",
  "kaban",
  "canta",
  "triko",
  "pantolon",
  "aksesuar",
];

type PopularSearchesProps = {
  searched: boolean;
  onSelect: (term: string) => void;
};

export function PopularSearches({ searched, onSelect }: PopularSearchesProps) {
  if (searched) {
    return null;
  }

  return (
    <div className="p-4">
      <p className="mb-3 text-sm text-stone-500">Populer aramalar</p>
      <div className="flex flex-wrap gap-2">
        {POPULAR_SEARCHES.map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => onSelect(term)}
            className="rounded-full bg-stone-100 px-4 py-2 text-sm transition-colors hover:bg-amber-100 hover:text-amber-700"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}
