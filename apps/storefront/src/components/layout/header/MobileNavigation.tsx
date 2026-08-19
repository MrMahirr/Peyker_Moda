import Link from "next/link";
import { useState } from "react";
import { Menu, ChevronDown, ChevronUp } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CollectionLink } from "./types";

interface MobileNavigationProps {
  collections: CollectionLink[];
  shouldApplyScrolledStyle: boolean;
  hasSaleProducts?: boolean;
}

export function MobileNavigation({
  collections,
  shouldApplyScrolledStyle,
  hasSaleProducts = false,
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={`md:hidden cursor-pointer ${
            shouldApplyScrolledStyle ? "text-stone-900" : "text-white"
          }`}
          aria-label="Mobil menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 flex flex-col">
        <SheetHeader className="p-6 border-b text-left">
          <SheetTitle className="text-xl font-bold tracking-tight">Menü</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col p-4 overflow-y-auto flex-1">
          <nav className="flex flex-col gap-2">
            <Link 
              href="/" 
              className="py-3 px-4 text-base font-medium rounded-md hover:bg-stone-50 transition-colors"
              onClick={closeMenu}
            >
              Ana Sayfa
            </Link>
            
            {/* Koleksiyonlar Akordiyonu */}
            <div className="flex flex-col">
              <button 
                className="py-3 px-4 text-base font-medium rounded-md hover:bg-stone-50 transition-colors flex justify-between items-center"
                onClick={() => setIsCollectionsOpen(!isCollectionsOpen)}
              >
                Koleksiyonlar
                {isCollectionsOpen ? (
                  <ChevronUp className="w-4 h-4 opacity-70" />
                ) : (
                  <ChevronDown className="w-4 h-4 opacity-70" />
                )}
              </button>
              
              {isCollectionsOpen && (
                <div className="flex flex-col ml-4 border-l-2 border-stone-100 pl-2 mt-1 mb-2 space-y-1">
                  <Link
                    href="/koleksiyonlar/cok-satanlar"
                    className="py-2 px-4 text-sm font-semibold text-amber-600 rounded-md hover:bg-stone-50 transition-colors"
                    onClick={closeMenu}
                  >
                    Çok Satanlar
                  </Link>
                  {collections.map((collection) => (
                    <Link
                      key={collection.slug}
                      href={`/koleksiyonlar/${collection.slug}`}
                      className="py-2 px-4 text-sm text-stone-600 rounded-md hover:bg-stone-50 transition-colors"
                      onClick={closeMenu}
                    >
                      {collection.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            <Link 
              href="/giyim" 
              className="py-3 px-4 text-base font-medium rounded-md hover:bg-stone-50 transition-colors"
              onClick={closeMenu}
            >
              Giyim
            </Link>
            
            <Link 
              href="/aksesuar" 
              className="py-3 px-4 text-base font-medium rounded-md hover:bg-stone-50 transition-colors"
              onClick={closeMenu}
            >
              Aksesuar
            </Link>
            
            {hasSaleProducts && (
              <Link 
                href="/indirim" 
                className="py-3 px-4 text-base font-semibold text-rose-500 rounded-md hover:bg-rose-50 transition-colors"
                onClick={closeMenu}
              >
                İndirim
              </Link>
            )}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
