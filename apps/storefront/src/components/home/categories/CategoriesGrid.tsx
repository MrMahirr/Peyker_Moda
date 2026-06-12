import { CategoryCard } from "./CategoryCard";
import { CategoryDisplay } from "./types";

type CategoriesGridProps = {
  categories: CategoryDisplay[];
};

export function CategoriesGrid({ categories }: CategoriesGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {categories.map((category, index) => (
        <CategoryCard
          key={`${category.slug || category.name}-${index}`}
          category={category}
          index={index}
        />
      ))}
    </div>
  );
}
