"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyFavoritesState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-12 shadow-sm border border-stone-100 text-center"
    >
      <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Heart className="w-10 h-10 text-stone-300" />
      </div>
      <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">
        Henuz favoriniz yok
      </h3>
      <p className="text-stone-500 mb-6 max-w-md mx-auto">
        Begendiginiz urunleri favorilere ekleyerek daha sonra kolayca
        ulasabilirsiniz.
      </p>
      <Link href="/">
        <Button className="bg-stone-900 hover:bg-amber-600 text-white">
          Urunleri Kesfet
        </Button>
      </Link>
    </motion.div>
  );
}
