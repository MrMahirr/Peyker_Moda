import { useEffect, useState } from "react";

import { storeApi } from "@/lib/api";
import { collectionsFallback } from "@/lib/data";

import { CollectionDisplay } from "../types";

export const useHomeCollections = () => {
  const [collections, setCollections] =
    useState<CollectionDisplay[]>(collectionsFallback);

  useEffect(() => {
    let isMounted = true;

    const fetchCollections = async () => {
      try {
        const apiCollections = await storeApi.getCollections();

        if (isMounted && apiCollections.length > 0) {
          setCollections(
            apiCollections.map((c) => ({
              name: c.name,
              image: c.imageUrl || "/peyker-moda-kapak3.png",
              slug: c.slug,
            })),
          );
        }
      } catch {
        // Keep fallback collections from data.ts when the API is unavailable.
      }
    };

    fetchCollections();

    return () => {
      isMounted = false;
    };
  }, []);

  return { collections };
};
