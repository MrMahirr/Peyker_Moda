import { storeApi } from "@/lib/api";

import { HeroSlide } from "../types";

type BannerResponse = Awaited<ReturnType<typeof storeApi.getBanners>>;

export const mapBannersToHeroSlides = (banners: BannerResponse): HeroSlide[] =>
  banners.map((banner, index) => ({
    id: banner.id || index,
    image: banner.imageUrl,
    title: banner.title,
    subtitle: banner.subtitle || "",
    cta: banner.ctaText || "Kesfet",
    link: banner.ctaLink || banner.link || "/giyim",
  }));
