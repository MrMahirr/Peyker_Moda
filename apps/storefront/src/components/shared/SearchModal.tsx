"use client";

import { AnimatePresence } from "framer-motion";

import { PopularSearches } from "./search-modal/PopularSearches";
import { SearchInputForm } from "./search-modal/SearchInputForm";
import { SearchModalFooter } from "./search-modal/SearchModalFooter";
import { SearchModalPanel } from "./search-modal/SearchModalPanel";
import { SearchResults } from "./search-modal/SearchResults";
import { useSearchModal } from "./search-modal/hooks/useSearchModal";
import { SearchModalProps } from "./search-modal/types";

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const search = useSearchModal({ isOpen, onClose });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <SearchModalPanel onClose={onClose}>
        <SearchInputForm
          inputRef={search.inputRef}
          query={search.query}
          onQueryChange={search.setQuery}
          onClear={search.clearQuery}
          onSubmit={search.handleSubmit}
        />

        <div className="max-h-[60vh] overflow-y-auto">
          <SearchResults
            query={search.query}
            results={search.results}
            loading={search.loading}
            searched={search.searched}
            onProductClick={onClose}
            onViewAll={search.submitSearch}
          />

          <PopularSearches
            searched={search.searched}
            onSelect={search.selectPopularSearch}
          />
        </div>

        <SearchModalFooter />
      </SearchModalPanel>
    </AnimatePresence>
  );
}
