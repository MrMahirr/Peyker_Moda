import { Button } from "@/components/ui/button";

type FilterHeaderProps = {
  onReset: () => void;
};

export function FilterHeader({ onReset }: FilterHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-serif font-semibold text-stone-900">
        Filtrele
      </h3>
      <Button
        variant="link"
        className="h-auto p-0 text-sm text-amber-600 hover:text-amber-700"
        onClick={onReset}
      >
        Temizle
      </Button>
    </div>
  );
}
