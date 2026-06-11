"use client";

import { motion } from "framer-motion";
import { Building2, Check, Home, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Address } from "./types";

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressCardProps) {
  return (
    <motion.div
      layout
      className={`bg-white rounded-xl p-5 shadow-sm border-2 transition-colors relative ${
        address.isDefault ? "border-amber-400" : "border-stone-100"
      }`}
    >
      {address.isDefault && (
        <span className="absolute -top-2 left-4 bg-amber-500 text-white text-xs px-2 py-0.5 rounded">
          Varsayilan
        </span>
      )}

      <div className="flex items-start gap-3 mb-4">
        <AddressTypeIcon type={address.type} />
        <div className="flex-1">
          <h4 className="font-bold text-stone-900">{address.title}</h4>
          <p className="text-sm text-stone-500">{address.fullName}</p>
        </div>
      </div>

      <p className="text-sm text-stone-600 mb-2">{address.address}</p>
      <p className="text-sm text-stone-600 mb-2">
        {address.district}, {address.city} {address.postalCode}
      </p>
      <p className="text-sm text-stone-500 mb-4">{address.phone}</p>

      <div className="flex gap-2 pt-3 border-t border-stone-100">
        {!address.isDefault && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetDefault(address.id)}
            className="flex-1 text-amber-600 border-amber-200 hover:bg-amber-50"
          >
            <Check className="w-4 h-4 mr-1" />
            Varsayilan Yap
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => onEdit(address)}>
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(address.id)}
          className="text-rose-500 hover:bg-rose-50 border-rose-200"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

function AddressTypeIcon({ type }: { type: Address["type"] }) {
  const isHome = type === "home";

  return (
    <div className={`p-2 rounded-lg ${isHome ? "bg-blue-50" : "bg-purple-50"}`}>
      {isHome ? (
        <Home className="w-5 h-5 text-blue-600" />
      ) : (
        <Building2 className="w-5 h-5 text-purple-600" />
      )}
    </div>
  );
}
