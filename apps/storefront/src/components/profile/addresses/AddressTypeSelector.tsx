import { Building2, Home } from "lucide-react";
import { AddressType } from "./types";

interface AddressTypeSelectorProps {
  value: AddressType;
  onChange: (value: AddressType) => void;
}

export function AddressTypeSelector({
  value,
  onChange,
}: AddressTypeSelectorProps) {
  return (
    <div className="flex gap-3">
      <AddressTypeButton
        selected={value === "home"}
        icon={<Home className="w-4 h-4" />}
        label="Ev"
        onClick={() => onChange("home")}
      />
      <AddressTypeButton
        selected={value === "work"}
        icon={<Building2 className="w-4 h-4" />}
        label="Is"
        onClick={() => onChange("work")}
      />
    </div>
  );
}

function AddressTypeButton({
  selected,
  icon,
  label,
  onClick,
}: {
  selected: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
        selected
          ? "border-amber-500 bg-amber-50 text-amber-700"
          : "border-stone-200 text-stone-600 hover:border-stone-300"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
