import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyAddressesStateProps {
  onAddClick: () => void;
}

export function EmptyAddressesState({ onAddClick }: EmptyAddressesStateProps) {
  return (
    <div className="bg-white rounded-xl p-12 shadow-sm border border-stone-100 text-center">
      <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <MapPin className="w-10 h-10 text-stone-300" />
      </div>
      <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">
        Kayitli adresiniz yok
      </h3>
      <p className="text-stone-500 mb-6">
        Siparislerinizi daha hizli tamamlamak icin adres ekleyin.
      </p>
      <Button
        onClick={onAddClick}
        className="bg-stone-900 hover:bg-amber-600 text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        Adres Ekle
      </Button>
    </div>
  );
}
