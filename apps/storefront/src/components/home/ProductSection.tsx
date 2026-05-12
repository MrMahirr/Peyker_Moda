"use client";

import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import ProductCard from "@/components/shared/ProductCard";

interface ProductSectionProduct {
  id: number | string;
  name: string;
  price: number;
  oldPrice?: number | null;
  image: string;
  tag?: string;
  slug?: string;
}

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: ProductSectionProduct[];
  bgColor?: string;
  isSale?: boolean;
  loading?: boolean;
}

export default function ProductSection({
  title,
  subtitle,
  products,
  bgColor = "bg-white",
  isSale = false,
  loading = false
}: ProductSectionProps) {
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
          <Link
            href={isSale ? '/indirim' : '/giyim'}
            className={`group flex items-center gap-2 font-medium transition-colors ${isSale ? 'text-rose-600 hover:text-rose-700' : 'text-stone-900 hover:text-amber-600'}`}
          >
            {isSale ? 'İndirimdeki Her Şey' : 'Tümünü Gör'}
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone-500">Ürün bulunamadı.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}



