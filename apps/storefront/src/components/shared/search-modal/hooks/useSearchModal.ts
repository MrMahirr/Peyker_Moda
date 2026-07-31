import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { storeApi } from "@/lib/api";

import { SearchResultProduct } from "../types";

type UseSearchModalParams = {
  isOpen: boolean;
  onClose: () => void;
};

export const useSearchModal = ({ isOpen, onClose }: UseSearchModalParams) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const focusTimeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => clearTimeout(focusTimeout);
  }, [isOpen]);

  useEffect(() => {
    let cancelled = false;

    const debounce = setTimeout(async () => {
      const trimmedQuery = query.trim();

      if (trimmedQuery.length < 2) {
        setResults([]);
        setSearched(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      setSearched(true);

      try {
        const result = await storeApi.getProducts({
          search: trimmedQuery,
          limit: 6,
        });

        if (!cancelled) {
          setResults(result.products);
        }
      } catch (error) {
        console.error("Search failed:", error);
        if (!cancelled) {
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(debounce);
    };
  }, [query]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const submitSearch = () => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    router.push(`/ara?q=${encodeURIComponent(trimmedQuery)}`);
    onClose();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitSearch();
  };

  const clearQuery = () => {
    setQuery("");
  };

  const selectPopularSearch = (term: string) => {
    setQuery(term);
  };

  return {
    inputRef,
    query,
    results,
    loading,
    searched,
    setQuery,
    clearQuery,
    selectPopularSearch,
    handleSubmit,
    submitSearch,
  };
};
