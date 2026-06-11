import Link from "next/link";

interface HeaderLogoProps {
  shouldApplyScrolledStyle: boolean;
}

export function HeaderLogo({ shouldApplyScrolledStyle }: HeaderLogoProps) {
  return (
    <Link href="/" className="flex-shrink-0">
      <h1
        className={`text-2xl md:text-3xl font-serif font-bold tracking-tight bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent transition-opacity duration-300 ${
          shouldApplyScrolledStyle ? "opacity-100" : "opacity-90"
        }`}
      >
        PEYKER MODA
      </h1>
    </Link>
  );
}
