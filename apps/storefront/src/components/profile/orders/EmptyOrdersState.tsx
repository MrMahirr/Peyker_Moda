import { Box } from "lucide-react";

export function EmptyOrdersState() {
  return (
    <div className="text-center py-20 bg-stone-50 rounded-xl border border-stone-100 border-dashed">
      <Box className="w-12 h-12 text-stone-300 mx-auto mb-3" />
      <h3 className="text-lg font-medium text-stone-900">Siparis Bulunamadi</h3>
      <p className="text-stone-500 text-sm">
        Henuz siparis kaydiniz bulunmuyor.
      </p>
    </div>
  );
}
