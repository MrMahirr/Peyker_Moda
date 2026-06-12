import { Loader2 } from "lucide-react";

export function ProductSectionLoading() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
    </div>
  );
}
