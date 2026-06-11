"use client";

import { Accordion } from "@/components/ui/accordion";
import { Product } from "@/lib/api";

import { ColorFilterSection } from "./filters/ColorFilterSection";
import { FilterHeader } from "./filters/FilterHeader";
import { PriceFilterSection } from "./filters/PriceFilterSection";
import { SizeFilterSection } from "./filters/SizeFilterSection";
import { useFilterAttributes } from "./filters/hooks/useFilterAttributes";
import { useFilterState } from "./filters/hooks/useFilterState";
import { Filters } from "./filters/types";

interface FilterSidebarProps {
  onFilterChange?: (filters: Filters) => void;
  categorySlug?: string;
  products?: Product[];
}

export default function FilterSidebar({
  onFilterChange,
  categorySlug,
  products,
}: FilterSidebarProps) {
  const attributes = useFilterAttributes({ categorySlug, products });
  const {
    selectedSizes,
    selectedColors,
    activePriceRange,
    handleSizeChange,
    handleColorChange,
    handlePriceChange,
    handlePriceCommit,
    handleReset,
  } = useFilterState({ attributes, onFilterChange });

  return (
    <div className="space-y-6">
      <FilterHeader onReset={handleReset} />

      <Accordion
        type="multiple"
        defaultValue={["category", "price", "size"]}
        className="w-full"
      >
        <PriceFilterSection
          min={attributes.priceRange[0]}
          max={attributes.priceRange[1]}
          value={activePriceRange}
          onChange={handlePriceChange}
          onCommit={handlePriceCommit}
        />

        <SizeFilterSection
          sizes={attributes.sizes}
          selectedSizes={selectedSizes}
          onSizeChange={handleSizeChange}
        />

        <ColorFilterSection
          colors={attributes.colors}
          selectedColors={selectedColors}
          onColorChange={handleColorChange}
        />
      </Accordion>
    </div>
  );
}
