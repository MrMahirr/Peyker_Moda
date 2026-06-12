import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { CategoryDisplay } from "./types";
import { getCategoryLink } from "./utils/categoryLink";

type CategoryCardProps = {
  category: CategoryDisplay;
  index: number;
};

export function CategoryCard({ category, index }: CategoryCardProps) {
  return (
    <Link href={getCategoryLink(category.slug)}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, duration: 0.6 }}
        className="group relative h-[450px] cursor-pointer overflow-hidden rounded-lg"
      >
        <Image
          src={category.image}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent opacity-80 transition-opacity" />
        <div className="absolute bottom-8 left-8 z-10 text-white">
          <h3 className="relative mb-3 inline-block font-serif text-3xl font-semibold">
            {category.name}
            <span className="absolute -bottom-1 left-0 h-0.5 w-1/3 bg-amber-500 transition-all duration-500 group-hover:w-full" />
          </h3>
          <p className="flex translate-y-4 items-center gap-2 text-sm font-medium opacity-0 transition-all delay-100 duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            Incele <ArrowRight className="h-4 w-4" />
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
