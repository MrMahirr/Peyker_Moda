import { useCallback, useEffect, useState } from "react";
import { storeApi } from "@/lib/api";
import { Address, AddressFormData } from "../types";

export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await storeApi.getAddresses();
      setAddresses(data as Address[]);
    } catch (caughtError) {
      const normalizedError =
        caughtError instanceof Error
          ? caughtError
          : new Error("Adresler yuklenemedi");
      setError(normalizedError);
      console.error("Failed to load addresses:", caughtError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const saveAddress = useCallback(
    async (formData: AddressFormData, editingId: string | null) => {
      if (editingId) {
        await storeApi.updateAddress(editingId, formData);
      } else {
        await storeApi.addAddress({
          ...formData,
          isDefault: addresses.length === 0,
        });
      }

      await fetchAddresses();
    },
    [addresses.length, fetchAddresses],
  );

  const deleteAddress = useCallback(async (id: string) => {
    const success = await storeApi.deleteAddress(id);
    if (success) {
      setAddresses((currentAddresses) =>
        currentAddresses.filter((address) => address.id !== id),
      );
    }
  }, []);

  const setDefaultAddress = useCallback(
    async (id: string) => {
      const success = await storeApi.setDefaultAddress(id);
      if (success) await fetchAddresses();
    },
    [fetchAddresses],
  );

  return {
    addresses,
    loading,
    error,
    refetch: fetchAddresses,
    saveAddress,
    deleteAddress,
    setDefaultAddress,
  };
}
