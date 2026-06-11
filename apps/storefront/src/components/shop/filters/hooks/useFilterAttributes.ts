import { useEffect, useMemo, useState } from "react";

import { Product, storeApi } from "@/lib/api";

import { buildAttributesFromProducts } from "../utils/filterAttributes";
import { DEFAULT_PRICE_RANGE, FilterAttributes } from "../types";

type UseFilterAttributesParams = {
  categorySlug?: string;
  products?: Product[];
};

export const useFilterAttributes = ({
  categorySlug,
  products,
}: UseFilterAttributesParams): FilterAttributes => {
  const dynamicAttributes = useMemo(
    () => (products ? buildAttributesFromProducts(products) : null),
    [products],
  );
  const [fetchedAttributes, setFetchedAttributes] = useState<FilterAttributes>({
    sizes: [],
    colors: [],
    priceRange: DEFAULT_PRICE_RANGE,
  });

  useEffect(() => {
    if (dynamicAttributes) {
      return;
    }

    let isMounted = true;

    const fetchAttributes = async () => {
      const data = await storeApi.getAttributes(categorySlug);
      if (isMounted) {
        setFetchedAttributes({ ...data, priceRange: DEFAULT_PRICE_RANGE });
      }
    };

    fetchAttributes();

    return () => {
      isMounted = false;
    };
  }, [categorySlug, dynamicAttributes]);

  return dynamicAttributes ?? fetchedAttributes;
};
