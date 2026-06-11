import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type SizeFilterSectionProps = {
  sizes: string[];
  selectedSizes: string[];
  onSizeChange: (size: string, checked: boolean) => void;
};

export function SizeFilterSection({
  sizes,
  selectedSizes,
  onSizeChange,
}: SizeFilterSectionProps) {
  return (
    <AccordionItem value="size" className="border-stone-200">
      <AccordionTrigger className="font-medium text-stone-800 hover:text-amber-600 hover:no-underline">
        Beden
      </AccordionTrigger>
      <AccordionContent>
        <div className="grid grid-cols-4 gap-2 pt-2">
          {sizes.map((size) => (
            <div key={size} className="flex items-center justify-center">
              <input
                type="checkbox"
                id={`size-${size}`}
                className="peer hidden"
                checked={selectedSizes.includes(size)}
                onChange={(event) => onSizeChange(size, event.target.checked)}
              />
              <label
                htmlFor={`size-${size}`}
                className="flex h-10 w-full cursor-pointer items-center justify-center rounded-md border border-stone-200 text-sm text-stone-600 transition-all hover:border-amber-500 peer-checked:border-stone-900 peer-checked:bg-stone-900 peer-checked:text-white"
              >
                {size}
              </label>
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
