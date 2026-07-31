import { FormEvent, RefObject } from "react";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";

type SearchInputFormProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  query: string;
  onQueryChange: (query: string) => void;
  onClear: () => void;
  onSubmit: (event: FormEvent) => void;
};

export function SearchInputForm({
  inputRef,
  query,
  onQueryChange,
  onClear,
  onSubmit,
}: SearchInputFormProps) {
  return (
    <form onSubmit={onSubmit} className="border-b border-stone-100 p-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Urun ara..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="h-14 rounded-xl border-0 bg-stone-50 pl-12 pr-12 text-lg focus-visible:ring-amber-500"
        />
        {query && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            aria-label="Aramayi temizle"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </form>
  );
}
