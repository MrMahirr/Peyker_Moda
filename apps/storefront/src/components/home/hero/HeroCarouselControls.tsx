import { CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export function HeroCarouselControls() {
  return (
    <>
      <CarouselPrevious className="left-4 hidden border-black/50 text-amber-400 hover:bg-white/20 hover:text-white md:flex" />
      <CarouselNext className="right-4 hidden border-black/50 text-amber-400 hover:bg-white/20 hover:text-white md:flex" />
    </>
  );
}
