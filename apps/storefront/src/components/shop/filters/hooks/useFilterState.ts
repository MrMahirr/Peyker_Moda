import { useMemo, useState } from "react";

import { FilterAttributes, FilterOverrides, Filters } from "../types";

type UseFilterStateParams = {
  attributes: FilterAttributes;
  onFilterChange?: (filters: Filters) => void;
};

export const useFilterState = ({
  attributes,
  onFilterChange,
}: UseFilterStateParams) => {
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>(
    attributes.priceRange,
  );
  const [isPriceRangeTouched, setIsPriceRangeTouched] = useState(false);

  const activePriceRange = useMemo<[number, number]>(() => {
    if (!isPriceRangeTouched) {
      return attributes.priceRange;
    }

    return [
      Math.max(
        attributes.priceRange[0],
        Math.min(priceRange[0], attributes.priceRange[1]),
      ),
      Math.max(
        attributes.priceRange[0],
        Math.min(priceRange[1], attributes.priceRange[1]),
      ),
    ];
  }, [attributes.priceRange, isPriceRangeTouched, priceRange]);

  const triggerChange = (overrides: FilterOverrides = {}) => {
    onFilterChange?.({
      sizes: overrides.sizes ?? selectedSizes,
      colors: overrides.colors ?? selectedColors,
      priceRange: overrides.priceRange ?? activePriceRange,
    });
  };

  const handleSizeChange = (size: string, checked: boolean) => {
    const newSizes = checked
      ? [...selectedSizes, size]
      : selectedSizes.filter((selectedSize) => selectedSize !== size);

    setSelectedSizes(newSizes);
    triggerChange({ sizes: newSizes });
  };

  const handleColorChange = (color: string) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter((selectedColor) => selectedColor !== color)
      : [...selectedColors, color];

    setSelectedColors(newColors);
    triggerChange({ colors: newColors });
  };

  const handlePriceChange = (value: number[]) => {
    const range = [value[0], value[1]] as [number, number];

    setIsPriceRangeTouched(true);
    setPriceRange(range);
  };

  const handlePriceCommit = (value: number[]) => {
    const range = [value[0], value[1]] as [number, number];

    setIsPriceRangeTouched(true);
    setPriceRange(range);
    triggerChange({ priceRange: range });
  };

  const handleReset = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setIsPriceRangeTouched(false);
    setPriceRange(attributes.priceRange);
    onFilterChange?.({
      sizes: [],
      colors: [],
      priceRange: attributes.priceRange,
    });
  };

  return {
    selectedSizes,
    selectedColors,
    priceRange,
    activePriceRange,
    handleSizeChange,
    handleColorChange,
    handlePriceChange,
    handlePriceCommit,
    handleReset,
  };
};
