import { useEffect, useState } from "react";

import { storeApi } from "@/lib/api";
import { categories as fallbackCategories } from "@/lib/data";

import { CategoryDisplay } from "../types";

const mapCollectionContentToCategories = (
  collections: Awaited<ReturnType<typeof storeApi.getCollectionContent>>,
): CategoryDisplay[] =>
  collections
    .filter((collection) => collection.isActive)
    .sort((first, second) => first.position - second.position)
    .map((collection) => ({
      name: collection.name,
      image: collection.imageUrl,
      slug: collection.slug || "",
    }));

export const useHomeCategories = () => {
  const [categories, setCategories] =
    useState<CategoryDisplay[]>(fallbackCategories);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const apiCollections = await storeApi.getCollectionContent();

        if (isMounted && apiCollections.length > 0) {
          setCategories(mapCollectionContentToCategories(apiCollections));
        }
      } catch {
        // Keep fallback categories from data.ts when API content is unavailable.
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return { categories };
};
