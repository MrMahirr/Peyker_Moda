import Link from "next/link";
import { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CollectionLink } from "./types";

interface DesktopNavigationProps {
  collections: CollectionLink[];
  shouldApplyScrolledStyle: boolean;
}

export function DesktopNavigation({
  collections,
  shouldApplyScrolledStyle,
}: DesktopNavigationProps) {
  return (
    <nav
      className={`hidden md:flex items-center gap-8 text-sm font-medium tracking-wide ${
        shouldApplyScrolledStyle ? "text-stone-700" : "text-white"
      }`}
    >
      <NavLink href="/">Ana Sayfa</NavLink>
      <CollectionsMenu collections={collections} />
      <NavLink href="/giyim">Giyim</NavLink>
      <NavLink href="/aksesuar">Aksesuar</NavLink>
      <Link
        href="/indirim"
        className="hover:text-amber-500 transition-colors relative group font-semibold text-rose-500 hover:text-rose-600"
      >
        Indirim
      </Link>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="hover:text-amber-500 transition-colors relative group"
    >
      {children}
    </Link>
  );
}

function CollectionsMenu({ collections }: { collections: CollectionLink[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="hover:text-amber-500 transition-colors flex items-center gap-1 focus:outline-none">
        Koleksiyonlar <ChevronDown className="w-4 h-4 opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-md border-stone-100">
        <DropdownMenuItem asChild>
          <Link
            href="/koleksiyonlar/cok-satanlar"
            className="cursor-pointer w-full font-semibold text-amber-600"
          >
            Cok Satanlar
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {collections.map((collection) => (
          <DropdownMenuItem key={collection.slug} asChild>
            <Link
              href={`/koleksiyonlar/${collection.slug}`}
              className="cursor-pointer w-full"
            >
              {collection.title}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
