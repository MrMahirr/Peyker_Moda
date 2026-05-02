"use client";

import React, { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { storeApi } from "@/lib/api";

interface FilterSidebarProps {
  onFilterChange?: (filters: {
    sizes: string[];
    colors: string[];
    priceRange: [number, number];
  }) => void;
}

export default function FilterSidebar({ onFilterChange }: FilterSidebarProps) {
  const [attributes, setAttributes] = useState<{ sizes: string[], colors: Array<{ name: string, value: string }> }>({
    sizes: [],
    colors: []
  });
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);

  useEffect(() => {
    const fetchAttributes = async () => {
      const data = await storeApi.getAttributes();
      setAttributes(data);
    };
    fetchAttributes();
  }, []);

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
    setPriceRange(range);
  };

  const handlePriceCommit = () => {
    triggerChange({ priceRange });
  };

  const triggerChange = (overrides: any = {}) => {
    if (onFilterChange) {
      onFilterChange({
        sizes: overrides.sizes ?? selectedSizes,
        colors: overrides.colors ?? selectedColors,
        priceRange: overrides.priceRange ?? priceRange,
      });
    }
  };

  const handleReset = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([0, 5000]);
    if (onFilterChange) {
      onFilterChange({ sizes: [], colors: [], priceRange: [0, 5000] });
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
                defaultValue={[0, 5000]}
                max={5000}
                step={100}
                value={priceRange}
                onValueChange={(v) => handlePriceChange(v)}
                onValueCommit={handlePriceCommit}
                className="mb-4"
              />
              <div className="flex justify-between text-sm text-stone-600 font-medium">
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
            <div className="flex flex-wrap gap-3 pt-2">
              {attributes.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleColorChange(color.name)}
                  className={`w-8 h-8 rounded-full shadow-sm hover:scale-110 transition-transform focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 border border-stone-200 ${
                    selectedColors.includes(color.name) ? 'ring-2 ring-amber-500 ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: color.value.toLowerCase() }}
                  aria-label={color.name}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}