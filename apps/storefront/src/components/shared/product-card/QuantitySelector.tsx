import { Minus, Plus } from "lucide-react";

type QuantitySelectorProps = {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
};

export function QuantitySelector({
  quantity,
  onDecrease,
  onIncrease,
}: QuantitySelectorProps) {
  return (
    <div>
      <div className="mb-2 text-sm font-semibold text-stone-800">Adet</div>
      <div className="flex w-fit items-center rounded-md border border-stone-200">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center text-stone-600 hover:bg-stone-50"
          onClick={onDecrease}
          aria-label="Adedi azalt"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-10 text-center text-sm font-bold text-stone-900">
          {quantity}
        </span>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center text-stone-600 hover:bg-stone-50"
          onClick={onIncrease}
          aria-label="Adedi arttir"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
