import Link from "next/link";
import { ReactNode } from "react";

interface HeaderIconLinkProps {
  href: string;
  icon: ReactNode;
  count?: number;
  countClassName: string;
  mounted: boolean;
  label: string;
}

export function HeaderIconLink({
  href,
  icon,
  count = 0,
  countClassName,
  mounted,
  label,
}: HeaderIconLinkProps) {
  return (
    <Link
      href={href}
      className="relative cursor-pointer hover:text-amber-500 transition-colors"
      aria-label={label}
    >
      {icon}
      {mounted && count > 0 && (
        <span
          className={`absolute -top-1.5 -right-1.5 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full ${countClassName}`}
        >
          {count}
        </span>
      )}
    </Link>
  );
}
