"use client";

import { FormEvent } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddressFormData } from "./types";
import { AddressTypeSelector } from "./AddressTypeSelector";

interface AddressFormProps {
  formData: AddressFormData;
  editingId: string | null;
  onSubmit: () => void;
  onCancel: () => void;
  onFieldChange: <Key extends keyof AddressFormData>(
    field: Key,
    value: AddressFormData[Key],
  ) => void;
}

export function AddressForm({
  formData,
  editingId,
  onSubmit,
  onCancel,
  onFieldChange,
}: AddressFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 mb-6"
    >
      <h3 className="text-lg font-bold mb-4">
        {editingId ? "Adresi Duzenle" : "Yeni Adres Ekle"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Adres Basligi</Label>
            <Input
              id="title"
              placeholder="Orn: Ev Adresim"
              value={formData.title}
              onChange={(event) => onFieldChange("title", event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Adres Tipi</Label>
            <AddressTypeSelector
              value={formData.type}
              onChange={(type) => onFieldChange("type", type)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Ad Soyad</Label>
            <Input
              id="fullName"
              placeholder="Ad Soyad"
              value={formData.fullName}
              onChange={(event) =>
                onFieldChange("fullName", event.target.value)
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              placeholder="+90 555 123 4567"
              value={formData.phone}
              onChange={(event) => onFieldChange("phone", event.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Acik Adres</Label>
          <Input
            id="address"
            placeholder="Mahalle, sokak, bina no, daire no"
            value={formData.address}
            onChange={(event) => onFieldChange("address", event.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">Il</Label>
            <Input
              id="city"
              placeholder="Istanbul"
              value={formData.city}
              onChange={(event) => onFieldChange("city", event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">Ilce</Label>
            <Input
              id="district"
              placeholder="Kadikoy"
              value={formData.district}
              onChange={(event) =>
                onFieldChange("district", event.target.value)
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Posta Kodu</Label>
            <Input
              id="postalCode"
              placeholder="34000"
              value={formData.postalCode}
              onChange={(event) =>
                onFieldChange("postalCode", event.target.value)
              }
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="bg-stone-900 hover:bg-amber-600 text-white"
          >
            {editingId ? "Guncelle" : "Kaydet"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Iptal
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
