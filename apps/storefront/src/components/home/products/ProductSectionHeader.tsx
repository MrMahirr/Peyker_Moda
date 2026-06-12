import Link from "next/link";
import { ArrowRight } from "lucide-react";

type ProductSectionHeaderProps = {
  title: string;
  subtitle?: string;
  isSale: boolean;
};

export function ProductSectionHeader({
  title,
  subtitle,
  isSale,
}: ProductSectionHeaderProps) {
  return (
    <div className="mb-16 flex flex-col items-end justify-between gap-4 md:flex-row">
      <div>
        {isSale && (
          <span className="mb-2 block text-sm font-bold uppercase tracking-wider text-rose-600">
            Sinirli Sure
          </span>
        )}
        <h2 className="mb-2 font-serif text-3xl font-bold text-stone-900 md:text-4xl">
          {title}
        </h2>
        {subtitle && <p className="font-light text-stone-600">{subtitle}</p>}
      </div>

      <Link
        href={isSale ? "/indirim" : "/giyim"}
        className={`group flex items-center gap-2 font-medium transition-colors ${
          isSale
            ? "text-rose-600 hover:text-rose-700"
            : "text-stone-900 hover:text-amber-600"
        }`}
      >
        {isSale ? "Indirimdeki Her Sey" : "Tumunu Gor"}
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
