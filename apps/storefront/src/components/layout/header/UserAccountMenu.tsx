import Link from "next/link";
import { LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StoreUser } from "@/lib/api";

interface UserAccountMenuProps {
  mounted: boolean;
  isLoggedIn: boolean;
  user: StoreUser | null;
  onLogout: () => void;
}

export function UserAccountMenu({
  mounted,
  isLoggedIn,
  user,
  onLogout,
}: UserAccountMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="hover:text-amber-500 transition-colors focus:outline-none flex items-center gap-2">
        <User className="w-5 h-5" />
        <span className="hidden lg:inline text-sm font-medium">
          {mounted
            ? isLoggedIn
              ? user?.firstName || "Hesabim"
              : "Giris"
            : "Giris"}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-white/95 backdrop-blur-md border-stone-850"
      >
        {mounted && isLoggedIn ? (
          <LoggedInMenu user={user} onLogout={onLogout} />
        ) : (
          <GuestMenu />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LoggedInMenu({
  user,
  onLogout,
}: {
  user: StoreUser | null;
  onLogout: () => void;
}) {
  return (
    <>
      <DropdownMenuLabel>
        Merhaba, {user?.firstName || "Kullanici"}
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link href="/profil" className="cursor-pointer w-full font-semibold">
          Profilim
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link
          href="/profil?tab=orders"
          className="cursor-pointer w-full font-semibold"
        >
          Siparislerim
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href="/favoriler" className="cursor-pointer w-full font-semibold">
          Favorilerim
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={onLogout}
        className="cursor-pointer text-rose-600 focus:text-rose-600"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Cikis Yap
      </DropdownMenuItem>
    </>
  );
}

function GuestMenu() {
  return (
    <>
      <DropdownMenuLabel>Hesap</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link href="/giris" className="cursor-pointer w-full font-semibold">
          Giris Yap
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href="/kayit" className="cursor-pointer w-full">
          Kayit Ol
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link
          href="/siparis-takip"
          className="cursor-pointer w-full text-stone-500"
        >
          Siparis Takip
        </Link>
      </DropdownMenuItem>
    </>
  );
}
