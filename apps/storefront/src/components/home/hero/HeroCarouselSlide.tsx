import Image from "next/image";

import { CarouselItem } from "@/components/ui/carousel";

import { HeroSlideContent } from "./HeroSlideContent";
import { HeroSlide } from "./types";

type HeroCarouselSlideProps = {
  slide: HeroSlide;
  priority: boolean;
};

export function HeroCarouselSlide({ slide, priority }: HeroCarouselSlideProps) {
  return (
    <CarouselItem className="relative h-screen w-full">
      <Image
        src={slide.image}
        alt={slide.title}
        fill
        className="object-cover brightness-[0.7]"
        priority={priority}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent" />
      <HeroSlideContent slide={slide} />
    </CarouselItem>
  );
}
