"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AddressForm } from "./addresses/AddressForm";
import { AddressList } from "./addresses/AddressList";
import { AddressesHeader } from "./addresses/AddressesHeader";
import { AddressesLoadingState } from "./addresses/AddressesLoadingState";
import { EmptyAddressesState } from "./addresses/EmptyAddressesState";
import { useAddressForm } from "./addresses/hooks/useAddressForm";
import { useAddresses } from "./addresses/hooks/useAddresses";

export default function AddressesContent() {
  const {
    addresses,
    loading,
    error,
    saveAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAddresses();
  const {
    isOpen,
    editingId,
    formData,
    openCreateForm,
    openEditForm,
    closeForm,
    updateField,
  } = useAddressForm();

  const handleSubmit = async () => {
    await saveAddress(formData, editingId);
    closeForm();
  };

  if (loading) return <AddressesLoadingState />;

  if (error) {
    return (
      <div className="rounded-xl border border-rose-100 bg-rose-50 p-6 text-center text-sm font-medium text-rose-700">
        Adresler yuklenirken bir hata olustu.
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <AddressesHeader isFormOpen={isOpen} onAddClick={openCreateForm} />

      <AnimatePresence>
        {isOpen && (
          <AddressForm
            formData={formData}
            editingId={editingId}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            onFieldChange={updateField}
          />
        )}
      </AnimatePresence>

      {addresses.length === 0 && !isOpen ? (
        <EmptyAddressesState onAddClick={openCreateForm} />
      ) : (
        <AddressList
          addresses={addresses}
          onEdit={openEditForm}
          onDelete={deleteAddress}
          onSetDefault={setDefaultAddress}
        />
      )}
    </motion.div>
  );
}
