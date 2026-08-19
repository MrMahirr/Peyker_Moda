"use client";

import { useState, useEffect } from "react";
import { storeApi, Product } from "@/lib/api";

export function useSaleProducts() {
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [loadingSaleProducts, setLoadingSaleProducts] = useState(true);
  const [hasSaleProducts, setHasSaleProducts] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchSaleProducts = async () => {
      try {
        setLoadingSaleProducts(true);
        // We only need to know if there's at least one sale product for navbar,
        // but for homepage we need 8 products. 
        // 8 is a good number to fetch here and share state.
        const sale = await storeApi.getProducts({
          onSale: true,
          limit: 8,
        });

        if (isMounted) {
          setSaleProducts(sale.products);
          setHasSaleProducts(sale.products.length > 0);
        }
      } catch (error) {
        console.error("Failed to fetch sale products:", error);
      } finally {
        if (isMounted) {
          setLoadingSaleProducts(false);
        }
      }
    };

    fetchSaleProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    saleProducts,
    loadingSaleProducts,
    hasSaleProducts,
  };
}
