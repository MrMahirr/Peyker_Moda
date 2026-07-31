"use client";

import { HeroCarousel } from "./hero/HeroCarousel";
import { useHeroSlides } from "./hero/hooks/useHeroSlides";

export default function HeroSection() {
  const { slides, firstFallbackSlideId } = useHeroSlides();

  return (
    <section className="relative h-screen w-full overflow-hidden bg-stone-900">
      <HeroCarousel
        slides={slides}
        firstFallbackSlideId={firstFallbackSlideId}
      />
    </section>
  );
}
