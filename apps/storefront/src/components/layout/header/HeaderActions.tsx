import { Heart, Search, ShoppingBag } from "lucide-react";
import { StoreUser } from "@/lib/api";
import { HeaderIconLink } from "./HeaderIconLink";
import { UserAccountMenu } from "./UserAccountMenu";

interface HeaderActionsProps {
  shouldApplyScrolledStyle: boolean;
  mounted: boolean;
  itemCount: number;
  favoriteCount: number;
  isLoggedIn: boolean;
  user: StoreUser | null;
  onSearchClick: () => void;
  onLogout: () => void;
}

export function HeaderActions({
  shouldApplyScrolledStyle,
  mounted,
  itemCount,
  favoriteCount,
  isLoggedIn,
  user,
  onSearchClick,
  onLogout,
}: HeaderActionsProps) {
  return (
    <div
      className={`flex items-center gap-3 md:gap-5 ${
        shouldApplyScrolledStyle ? "text-stone-900" : "text-white"
      }`}
    >
      <button
        type="button"
        onClick={onSearchClick}
        className="hover:text-amber-500 transition-colors hidden sm:block"
        aria-label="Arama ac"
      >
        <Search className="w-5 h-5" />
      </button>

      <UserAccountMenu
        mounted={mounted}
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={onLogout}
      />

      <HeaderIconLink
        href="/favoriler"
        icon={<Heart className="w-5 h-5" />}
        count={favoriteCount}
        countClassName="bg-rose-500"
        mounted={mounted}
        label="Favoriler"
      />

      <HeaderIconLink
        href="/sepet"
        icon={<ShoppingBag className="w-5 h-5" />}
        count={itemCount}
        countClassName="bg-amber-500"
        mounted={mounted}
        label="Sepet"
      />
    </div>
  );
}
