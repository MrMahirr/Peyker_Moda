"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { categories as fallbackCategories } from "@/lib/data";
import { storeApi } from "@/lib/api";
import { fadeInUp } from "@/lib/utils";
import Link from 'next/link';

interface CategoryDisplay {
  name: string;
  image: string;
  slug?: string;
}

export default function CategoriesSection() {
  const [categories, setCategories] = useState<CategoryDisplay[]>(fallbackCategories);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiCategories = await storeApi.getCategories();
        if (apiCategories.length > 0) {
          setCategories(apiCategories.map(c => ({
            name: c.name,
            image: c.image || fallbackCategories[0]?.image || '',
            slug: c.slug,
          })));
        }
      } catch {
        // Fallback data.ts categories remain
      }
    };
    fetchCategories();
  }, []);

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ fadeInUp }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4 text-stone-900">
            Koleksiyonları Keşfet
          </h2>
          <p className="text-stone-500 text-lg max-w-2xl mx-auto font-light">
            Modern kadının gardırobunu tamamlayan zarif ve şık parçalar.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <Link key={idx} href={cat.slug ? `/giyim?category=${cat.slug}` : `/giyim/${idx}`}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="relative group cursor-pointer overflow-hidden rounded-lg h-[450px]"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent opacity-80 transition-opacity" />
              <div className="absolute bottom-8 left-8 text-white z-10">
                <h3 className="text-3xl font-serif font-semibold mb-3 relative inline-block">
                  {cat.name}
                  <span className="absolute -bottom-1 left-0 w-1/3 h-0.5 bg-amber-500 transition-all duration-500 group-hover:w-full"></span>
                </h3>
                <p className="flex items-center gap-2 text-sm font-medium opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                  İncele <ArrowRight className="w-4 h-4" />
                </p>
              </div>
            </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}