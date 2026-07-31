import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddressesHeaderProps {
  isFormOpen: boolean;
  onAddClick: () => void;
}

export function AddressesHeader({
  isFormOpen,
  onAddClick,
}: AddressesHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-serif font-bold text-stone-900">
        Adres Bilgilerim
      </h2>
      {!isFormOpen && (
        <Button
          onClick={onAddClick}
          className="bg-stone-900 hover:bg-amber-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Yeni Adres
        </Button>
      )}
    </div>
  );
}
