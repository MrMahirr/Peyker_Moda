import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";

type PriceFilterSectionProps = {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: number[]) => void;
  onCommit: (value: number[]) => void;
};

export function PriceFilterSection({
  min,
  max,
  value,
  onChange,
  onCommit,
}: PriceFilterSectionProps) {
  return (
    <AccordionItem value="price" className="border-stone-200">
      <AccordionTrigger className="font-medium text-stone-800 hover:text-amber-600 hover:no-underline">
        Fiyat Araligi
      </AccordionTrigger>
      <AccordionContent>
        <div className="px-2 pt-4">
          <Slider
            defaultValue={[min, max]}
            min={min}
            max={max}
            step={100}
            value={value}
            onValueChange={onChange}
            onValueCommit={onCommit}
            className="mb-4"
          />
          <div className="flex justify-between text-sm font-medium text-stone-600">
            <span>{value[0]} TL</span>
            <span>{value[1]} TL+</span>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
