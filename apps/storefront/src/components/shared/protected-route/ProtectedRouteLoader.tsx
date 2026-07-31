import { Loader2 } from "lucide-react";

export function ProtectedRouteLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-amber-600" />
        <p className="text-stone-500">Yukleniyor...</p>
      </div>
    </div>
  );
}
