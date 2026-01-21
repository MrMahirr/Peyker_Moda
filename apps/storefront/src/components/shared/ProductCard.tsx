"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, fadeInUp } from "@/lib/utils";

export default function ProductCard({ product }: { product: any }) {
  const isSale = product.oldPrice !== null;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{ fadeInUp }}
      className="group relative"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 mb-4 rounded-md">
        {product.tag && (
          <Badge
            className={`absolute top-3 left-3 z-20 rounded-sm shadow-sm ${isSale ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-white text-stone-900 hover:bg-white"}`}
          >
            {product.tag}
          </Badge>
        )}
        <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-20 hover:text-rose-500">
          <Heart className="w-5 h-5" />
        </button>
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 bg-gradient-to-t from-black/50 to-transparent">
          <Button className="w-full bg-white text-stone-900 hover:bg-stone-100 shadow-md font-medium">
            Sepete Ekle
          </Button>
        </div>
      </div>
      <div className="text-left">
        <h3 className="font-medium text-base mb-1 text-stone-800 group-hover:text-rose-600 transition-colors cursor-pointer line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          {isSale && (
            <span className="text-stone-400 line-through text-sm">
              {formatPrice(product.oldPrice)}
            </span>
          )}
          <p
            className={`font-semibold ${isSale ? "text-rose-600" : "text-stone-900"}`}
          >
            {formatPrice(product.price)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}