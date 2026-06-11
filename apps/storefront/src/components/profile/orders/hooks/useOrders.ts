import { useCallback, useEffect, useState } from "react";
import { storeApi } from "@/lib/api";
import { Order } from "../types";
import { transformOrder } from "../utils/orderMapper";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const apiOrders = await storeApi.getOrders();
      setOrders(apiOrders.map(transformOrder));
    } catch (caughtError) {
      const normalizedError =
        caughtError instanceof Error
          ? caughtError
          : new Error("Siparisler yuklenemedi");
      setError(normalizedError);
      console.error("Failed to fetch orders:", caughtError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
}
