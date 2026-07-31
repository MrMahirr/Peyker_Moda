import { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";

import { Carousel, CarouselContent } from "@/components/ui/carousel";

import { HeroCarouselControls } from "./HeroCarouselControls";
import { HeroCarouselSlide } from "./HeroCarouselSlide";
import { HeroSlide } from "./types";

type HeroCarouselProps = {
  slides: HeroSlide[];
  firstFallbackSlideId?: number | string;
};

export function HeroCarousel({
  slides,
  firstFallbackSlideId,
}: HeroCarouselProps) {
  const autoplay = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));

  return (
    <Carousel
      plugins={[autoplay.current]}
      className="h-full w-full"
      onMouseEnter={autoplay.current.stop}
      onMouseLeave={autoplay.current.reset}
    >
      <CarouselContent className="h-full">
        {slides.map((slide) => (
          <HeroCarouselSlide
            key={slide.id}
            slide={slide}
            priority={slide.id === 1 || slide.id === firstFallbackSlideId}
          />
        ))}
      </CarouselContent>
      <HeroCarouselControls />
    </Carousel>
  );
}
