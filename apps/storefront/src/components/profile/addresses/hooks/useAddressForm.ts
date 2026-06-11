import { useState } from "react";
import { Address, AddressFormData, EMPTY_ADDRESS_FORM } from "../types";

export function useAddressForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(EMPTY_ADDRESS_FORM);

  const openCreateForm = () => {
    setFormData(EMPTY_ADDRESS_FORM);
    setEditingId(null);
    setIsOpen(true);
  };

  const openEditForm = (address: Address) => {
    const { id: _id, isDefault: _isDefault, ...editableFields } = address;
    void _id;
    void _isDefault;
    setFormData(editableFields);
    setEditingId(address.id);
    setIsOpen(true);
  };

  const closeForm = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData(EMPTY_ADDRESS_FORM);
  };

  const updateField = <Key extends keyof AddressFormData>(
    field: Key,
    value: AddressFormData[Key],
  ) => {
    setFormData((currentData) => ({
      ...currentData,
      [field]: value,
    }));
  };

  return {
    isOpen,
    editingId,
    formData,
    openCreateForm,
    openEditForm,
    closeForm,
    updateField,
  };
}
