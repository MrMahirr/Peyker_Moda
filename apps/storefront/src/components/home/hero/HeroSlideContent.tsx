import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { fadeInUp } from "@/lib/utils";

import { HeroSlide } from "./types";

const heroContentAnimation = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

type HeroSlideContentProps = {
  slide: HeroSlide;
};

export function HeroSlideContent({ slide }: HeroSlideContentProps) {
  return (
    <div className="container absolute inset-0 z-20 mx-auto flex flex-col justify-center px-4 md:px-17">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={heroContentAnimation}
        className="max-w-3xl text-white"
      >
        <motion.h2
          variants={{ fadeInUp }}
          className="mb-6 font-serif text-5xl font-bold leading-none md:text-7xl lg:text-8xl"
        >
          {slide.title}
        </motion.h2>

        {slide.subtitle && (
          <motion.p
            variants={{ fadeInUp }}
            className="mb-10 max-w-lg text-lg font-light leading-relaxed text-stone-200 md:text-2xl"
          >
            {slide.subtitle}
          </motion.p>
        )}

        <motion.div variants={{ fadeInUp }}>
          <Link href={slide.link || "/giyim"}>
            <Button
              size="lg"
              className="h-14 rounded-sm bg-white px-10 text-md font-medium tracking-wide text-stone-900 transition-transform hover:scale-105 hover:bg-amber-50"
            >
              {slide.cta}
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
