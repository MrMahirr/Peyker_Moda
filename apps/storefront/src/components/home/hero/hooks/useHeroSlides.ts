import { useEffect, useState } from "react";

import { storeApi } from "@/lib/api";
import { heroSlides as fallbackSlides } from "@/lib/data";

import { HeroSlide } from "../types";
import { mapBannersToHeroSlides } from "../utils/heroSlideMapper";

export const useHeroSlides = () => {
  const [slides, setSlides] = useState<HeroSlide[]>(fallbackSlides);

  useEffect(() => {
    let isMounted = true;

    const fetchBanners = async () => {
      try {
        const banners = await storeApi.getBanners("hero");

        if (isMounted && banners.length > 0) {
          setSlides(mapBannersToHeroSlides(banners));
        }
      } catch {
        // Keep fallback slides from data.ts when banner content is unavailable.
      }
    };

    fetchBanners();

    return () => {
      isMounted = false;
    };
  }, []);

  return { slides, firstFallbackSlideId: fallbackSlides[0]?.id };
};
