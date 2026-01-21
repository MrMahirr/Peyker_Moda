"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from "@/components/shared/ProductCard";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: any[];
  bgColor?: string;
  isSale?: boolean;
}

export default function ProductSection({ title, subtitle, products, bgColor = "bg-white", isSale = false }: ProductSectionProps) {
  return (
    <section className={`py-24 ${bgColor} relative overflow-hidden`}>
      {isSale && (
        <div className="absolute top-0 left-0 w-full h-1/2 bg-amber-50/50 -skew-y-3 transform origin-top-left z-0" />
      )}

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
          <div>
            {isSale && <span className="text-rose-600 font-bold tracking-wider uppercase text-sm mb-2 block">Sınırlı Süre</span>}
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2 text-stone-900">{title}</h2>
            {subtitle && <p className="text-stone-600 font-light">{subtitle}</p>}
          </div>
          <Link href="#" className={`group flex items-center gap-2 font-medium transition-colors ${isSale ? 'text-rose-600 hover:text-rose-700' : 'text-stone-900 hover:text-amber-600'}`}>
            {isSale ? 'İndirimdeki Her Şey' : 'Tümünü Gör'}
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}