import { useState } from "react";
import { toast } from "sonner";
import { storeApi } from "@/lib/api";

export function useOrderInvoice(orderId: string) {
  const [loading, setLoading] = useState(false);

  const openInvoice = async () => {
    setLoading(true);

    try {
      const res = await storeApi.getInvoice(orderId);
      if (res.success && res.url) {
        window.open(res.url, "_blank");
        return;
      }

      toast.error(res.message || "Fatura bulunamadi.");
    } catch {
      toast.error("Fatura yuklenirken hata olustu.");
    } finally {
      setLoading(false);
    }
  };

  return { loading, openInvoice };
}
