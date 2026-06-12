"use client";

import { CategoriesGrid } from "./categories/CategoriesGrid";
import { CategoriesHeader } from "./categories/CategoriesHeader";
import { useHomeCategories } from "./categories/hooks/useHomeCategories";

export default function CategoriesSection() {
  const { categories } = useHomeCategories();

  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-4 md:px-8">
        <CategoriesHeader />
        <CategoriesGrid categories={categories} />
      </div>
    </section>
  );
}
