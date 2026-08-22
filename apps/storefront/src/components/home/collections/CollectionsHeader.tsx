import { motion } from "framer-motion";

import { fadeInUp } from "@/lib/utils";

export function CollectionsHeader() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{ fadeInUp }}
      className="mb-16 text-center"
    >
      <h2 className="mb-4 font-serif text-3xl font-bold text-stone-900 md:text-5xl">
        Koleksiyonlari Kesfet
      </h2>
      <p className="mx-auto max-w-2xl text-lg font-light text-stone-500">
        Modern kadinin gardirobunu tamamlayan zarif ve sik parcalar.
      </p>
    </motion.div>
  );
}
