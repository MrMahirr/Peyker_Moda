type SaleSectionBackgroundProps = {
  isSale: boolean;
};

export function SaleSectionBackground({ isSale }: SaleSectionBackgroundProps) {
  if (!isSale) {
    return null;
  }

  return (
    <div className="absolute left-0 top-0 z-0 h-1/2 w-full origin-top-left -skew-y-3 bg-amber-50/50 transform" />
  );
}
