"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Product, storeApi } from "@/lib/api";

type Filters = {
  sizes: string[];
  colors: string[];
  priceRange: [number, number];
};

type FilterAttributes = {
  sizes: string[];
  colors: Array<{ name: string; value: string }>;
  priceRange: [number, number];
};

interface FilterSidebarProps {
  onFilterChange?: (filters: Filters) => void;
  categorySlug?: string;
  products?: Product[];
}

type FilterOverrides = Partial<Filters>;
type ProductVariantLike = NonNullable<Product["variants"]>[number] & Record<string, unknown>;

const DEFAULT_PRICE_RANGE: [number, number] = [0, 5000];

const getVariantValue = (variant: ProductVariantLike, keys: string[]) => {
  const attributes = variant.attributes as Record<string, unknown> | undefined;

  for (const key of keys) {
    const value = attributes?.[key] ?? variant[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
};

const buildAttributesFromProducts = (products: Product[]): FilterAttributes => {
  const sizes = new Set<string>();
  const colors = new Set<string>();
  let maxPrice = 0;

  products.forEach((product) => {
    const price = Number(product.price || 0);
    if (Number.isFinite(price)) {
      maxPrice = Math.max(maxPrice, price);
    }

    product.variants?.forEach((variant) => {
      const variantLike = variant as ProductVariantLike;
      const size = getVariantValue(variantLike, ["size", "beden", "Beden", "Size"]);
      const color = getVariantValue(variantLike, ["color", "renk", "Renk", "Color"]);

      if (size) sizes.add(size);
      if (color) colors.add(color);
    });
  });

  const priceMax = maxPrice > 0 ? Math.ceil(maxPrice / 100) * 100 : DEFAULT_PRICE_RANGE[1];

  return {
    sizes: Array.from(sizes).sort(),
    colors: Array.from(colors).sort().map((color) => ({ name: color, value: color })),
    priceRange: [0, priceMax],
  };
};

export default function FilterSidebar({ onFilterChange, categorySlug, products }: FilterSidebarProps) {
  const dynamicAttributes = useMemo(
    () => products ? buildAttributesFromProducts(products) : null,
    [products]
  );
  const [fetchedAttributes, setFetchedAttributes] = useState<FilterAttributes>({
    sizes: [],
    colors: [],
    priceRange: DEFAULT_PRICE_RANGE,
  });
  const attributes = dynamicAttributes ?? fetchedAttributes;
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>(DEFAULT_PRICE_RANGE);
  const [isPriceRangeTouched, setIsPriceRangeTouched] = useState(false);

  const activePriceRange = useMemo<[number, number]>(() => {
    if (!isPriceRangeTouched) {
      return attributes.priceRange;
    }

    return [
      Math.max(attributes.priceRange[0], Math.min(priceRange[0], attributes.priceRange[1])),
      Math.max(attributes.priceRange[0], Math.min(priceRange[1], attributes.priceRange[1])),
    ];
  }, [attributes.priceRange, isPriceRangeTouched, priceRange]);

  useEffect(() => {
    if (dynamicAttributes) {
      return;
    }

    let isMounted = true;

    const fetchAttributes = async () => {
      const data = await storeApi.getAttributes(categorySlug);
      if (isMounted) {
        setFetchedAttributes({ ...data, priceRange: DEFAULT_PRICE_RANGE });
      }
    };

    fetchAttributes();

    return () => {
      isMounted = false;
    };
  }, [categorySlug, dynamicAttributes]);

  const handleSizeChange = (size: string, checked: boolean) => {
    const newSizes = checked
      ? [...selectedSizes, size]
      : selectedSizes.filter(s => s !== size);
    setSelectedSizes(newSizes);
    triggerChange({ sizes: newSizes });
  };

  const handleColorChange = (color: string) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter(c => c !== color)
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

  const triggerChange = (overrides: FilterOverrides = {}) => {
    if (onFilterChange) {
      onFilterChange({
        sizes: overrides.sizes ?? selectedSizes,
        colors: overrides.colors ?? selectedColors,
        priceRange: overrides.priceRange ?? activePriceRange,
      });
    }
  };

  const handleReset = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setIsPriceRangeTouched(false);
    setPriceRange(attributes.priceRange);
    if (onFilterChange) {
      onFilterChange({ sizes: [], colors: [], priceRange: attributes.priceRange });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-serif font-semibold text-stone-900">Filtrele</h3>
        <Button 
          variant="link" 
          className="text-amber-600 p-0 h-auto text-sm hover:text-amber-700"
          onClick={handleReset}
        >
          Temizle
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["category", "price", "size"]} className="w-full">
        {/* Fiyat Filtresi */}
        <AccordionItem value="price" className="border-stone-200">
          <AccordionTrigger className="text-stone-800 font-medium hover:text-amber-600 hover:no-underline">Fiyat Aralığı</AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 px-2">
              <Slider
                defaultValue={attributes.priceRange}
                min={attributes.priceRange[0]}
                max={attributes.priceRange[1]}
                step={100}
                value={activePriceRange}
                onValueChange={(v) => handlePriceChange(v)}
                onValueCommit={handlePriceCommit}
                className="mb-4"
              />
              <div className="flex justify-between text-sm text-stone-600 font-medium">
                <span>{activePriceRange[0]} TL</span>
                <span>{activePriceRange[1]} TL+</span>
              </div>
              <div className="hidden">
                <span>{priceRange[0]} ₺</span>
                <span>{priceRange[1]} ₺+</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Beden Filtresi */}
        <AccordionItem value="size" className="border-stone-200">
          <AccordionTrigger className="text-stone-800 font-medium hover:text-amber-600 hover:no-underline">Beden</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-4 gap-2 pt-2">
              {attributes.sizes.map((size) => (
                <div key={size} className="flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    id={`size-${size}`} 
                    className="peer hidden"
                    checked={selectedSizes.includes(size)}
                    onChange={(e) => handleSizeChange(size, e.target.checked)}
                  />
                  <label
                    htmlFor={`size-${size}`}
                    className="w-full h-10 flex items-center justify-center border border-stone-200 rounded-md text-sm cursor-pointer text-stone-600 hover:border-amber-500 peer-checked:bg-stone-900 peer-checked:text-white peer-checked:border-stone-900 transition-all"
                  >
                    {size}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Renk Filtresi */}
        <AccordionItem value="color" className="border-stone-200">
          <AccordionTrigger className="text-stone-800 font-medium hover:text-amber-600 hover:no-underline">Renk</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-2 pt-2">
              {attributes.colors.map((color) => (
                <div key={color.name} className="flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    id={`color-${color.name}`} 
                    className="peer hidden"
                    checked={selectedColors.includes(color.name)}
                    onChange={() => handleColorChange(color.name)}
                  />
                  <label
                    htmlFor={`color-${color.name}`}
                    className="w-full h-10 flex items-center justify-center border border-stone-200 rounded-md text-sm cursor-pointer text-stone-600 hover:border-amber-500 peer-checked:bg-stone-900 peer-checked:text-white peer-checked:border-stone-900 transition-all"
                  >
                    {color.name}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
