"use client";

import React, { useState } from 'react';
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const categories = ["Elbiseler", "Dış Giyim", "Triko", "Pantolon", "Etek", "Gömlek & Bluz", "Aksesuar"];
const sizes = ["XS", "S", "M", "L", "XL"];
const colors = [
  { name: "black", bg: "bg-black" },
  { name: "white", bg: "bg-white border border-gray-200" },
  { name: "beige", bg: "bg-[#F5F5DC]" },
  { name: "brown", bg: "bg-[#8B4513]" },
  { name: "blue", bg: "bg-blue-800" },
  { name: "gray", bg: "bg-gray-500" },
];

export default function FilterSidebar() {
  const [priceRange, setPriceRange] = useState([0, 5000]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-serif font-semibold text-stone-900">Filtrele</h3>
        <Button variant="link" className="text-amber-600 p-0 h-auto text-sm hover:text-amber-700">Temizle</Button>
      </div>

      <Accordion type="multiple" defaultValue={["category", "price", "size"]} className="w-full">

        {/* Kategori Filtresi */}
        <AccordionItem value="category" className="border-stone-200">
          <AccordionTrigger className="text-stone-800 font-medium hover:text-amber-600 hover:no-underline">Kategoriler</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {categories.map((cat) => (
                <div key={cat} className="flex items-center space-x-3">
                  <Checkbox id={cat} className="border-stone-300 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500" />
                  <Label htmlFor={cat} className="text-stone-600 cursor-pointer font-normal">{cat}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

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
                onValueChange={setPriceRange}
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
              {sizes.map((size) => (
                <div key={size} className="flex items-center justify-center">
                  <input type="checkbox" id={`size-${size}`} className="peer hidden" />
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
              {colors.map((color) => (
                <button
                  key={color.name}
                  className={`w-8 h-8 rounded-full ${color.bg} shadow-sm hover:scale-110 transition-transform focus:ring-2 focus:ring-offset-2 focus:ring-amber-500`}
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