type VariantOptionGroupProps = {
  label: string;
  options: string[];
  selectedValue: string;
  isAvailable: (value: string) => boolean;
  onSelect: (value: string) => void;
};

export function VariantOptionGroup({
  label,
  options,
  selectedValue,
  isAvailable,
  onSelect,
}: VariantOptionGroupProps) {
  if (options.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="mb-2 text-sm font-semibold text-stone-800">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const disabled = !isAvailable(option);

          return (
            <button
              key={option}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(option)}
              className={`min-w-11 rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
                selectedValue === option
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
