"use client";

import { ProductSectionContent } from "./products/ProductSectionContent";
import { ProductSectionHeader } from "./products/ProductSectionHeader";
import { SaleSectionBackground } from "./products/SaleSectionBackground";
import { ProductSectionProps } from "./products/types";

export default function ProductSection({
  title,
  subtitle,
  products,
  bgColor = "bg-white",
  isSale = false,
  loading = false,
}: ProductSectionProps) {
  return (
    <section className={`relative overflow-hidden py-24 ${bgColor}`}>
      <SaleSectionBackground isSale={isSale} />

      <div className="container relative z-10 mx-auto px-4 md:px-8">
        <ProductSectionHeader
          title={title}
          subtitle={subtitle}
          isSale={isSale}
        />
        <ProductSectionContent products={products} loading={loading} />
      </div>
    </section>
  );
}
