"use client";

import { useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { heroSlides } from "@/lib/data";
import { fadeInUp } from "@/lib/utils";
import Link from "next/link";

export default function HeroSection() {
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));

  return (
    <section className="relative h-screen w-full bg-stone-900 overflow-hidden">
      <Carousel
        plugins={[plugin.current]}
        className="w-full h-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent className="h-full">
          {heroSlides.map((slide) => (
            <CarouselItem key={slide.id} className="relative w-full h-screen">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover brightness-[0.7]"
                priority={slide.id === 1}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent" />
              <div className="absolute inset-0 container mx-auto px-4 md:px-17 flex flex-col justify-center z-20">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
                    },
                  }}
                  className="max-w-3xl text-white"
                >
                  <motion.h2
                    variants={{ fadeInUp }}
                    className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-none mb-6"
                  >
                    {slide.title}
                  </motion.h2>
                  <motion.p
                    variants={{ fadeInUp }}
                    className="text-lg md:text-2xl text-stone-200 mb-10 max-w-lg font-light leading-relaxed"
                  >
                    {slide.subtitle}
                  </motion.p>
                  <motion.div variants={{ fadeInUp }}>
                    <Link href={"/giyim"}>
                    <Button
                      size="lg"
                      className="bg-white text-stone-900 hover:bg-amber-50 rounded-sm px-10 h-14 text-md font-medium tracking-wide transition-transform hover:scale-105"
                    >
                      {slide.cta}
                    </Button>
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 border-black/50 text-amber-400 hover:bg-white/20 hover:text-white hidden md:flex" />
        <CarouselNext className="right-4 border-Black/50 text-amber-400 hover:bg-white/20 hover:text-white hidden md:flex" />
      </Carousel>
    </section>
  );
}