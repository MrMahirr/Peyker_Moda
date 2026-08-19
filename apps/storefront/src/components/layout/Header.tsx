"use client";

import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import SearchModal from "@/components/shared/SearchModal";
import { useCart } from "@/lib/CartContext";
import { useFavorites } from "@/lib/FavoritesContext";
import { DesktopNavigation } from "./header/DesktopNavigation";
import { HeaderActions } from "./header/HeaderActions";
import { HeaderLogo } from "./header/HeaderLogo";
import { useHeaderState } from "./header/hooks/useHeaderState";

export default function Header() {
  const { itemCount } = useCart();
  const { favorites } = useFavorites();
  const {
    mounted,
    isLoggedIn,
    user,
    isSearchOpen,
    openSearch,
    closeSearch,
    logout,
    collections,
    shouldApplyScrolledStyle,
    hasSaleProducts,
  } = useHeaderState();

  return (
    <motion.header
      className={`fixed top-0 w-full z-50 transition-all duration-500 border-b ${
        shouldApplyScrolledStyle
          ? "bg-white/70 backdrop-blur-md shadow-sm border-stone-200 py-3"
          : "bg-transparent border-transparent py-5"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
        <button
          type="button"
          className={`md:hidden cursor-pointer ${
            shouldApplyScrolledStyle ? "text-stone-900" : "text-white"
          }`}
          aria-label="Mobil menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <HeaderLogo shouldApplyScrolledStyle={shouldApplyScrolledStyle} />

        <DesktopNavigation
          collections={collections}
          shouldApplyScrolledStyle={shouldApplyScrolledStyle}
          hasSaleProducts={hasSaleProducts}
        />

        <HeaderActions
          shouldApplyScrolledStyle={shouldApplyScrolledStyle}
          mounted={mounted}
          itemCount={itemCount}
          favoriteCount={favorites.length}
          isLoggedIn={isLoggedIn}
          user={user}
          onSearchClick={openSearch}
          onLogout={logout}
        />
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />
    </motion.header>
  );
}
