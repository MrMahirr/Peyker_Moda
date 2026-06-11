import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { FilterAttributes } from "./types";

type ColorFilterSectionProps = {
  colors: FilterAttributes["colors"];
  selectedColors: string[];
  onColorChange: (color: string) => void;
};

export function ColorFilterSection({
  colors,
  selectedColors,
  onColorChange,
}: ColorFilterSectionProps) {
  return (
    <AccordionItem value="color" className="border-stone-200">
      <AccordionTrigger className="font-medium text-stone-800 hover:text-amber-600 hover:no-underline">
        Renk
      </AccordionTrigger>
      <AccordionContent>
        <div className="grid grid-cols-2 gap-2 pt-2">
          {colors.map((color) => (
            <div key={color.name} className="flex items-center justify-center">
              <input
                type="checkbox"
                id={`color-${color.name}`}
                className="peer hidden"
                checked={selectedColors.includes(color.name)}
                onChange={() => onColorChange(color.name)}
              />
              <label
                htmlFor={`color-${color.name}`}
                className="flex h-10 w-full cursor-pointer items-center justify-center rounded-md border border-stone-200 text-sm text-stone-600 transition-all hover:border-amber-500 peer-checked:border-stone-900 peer-checked:bg-stone-900 peer-checked:text-white"
              >
                {color.name}
              </label>
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
