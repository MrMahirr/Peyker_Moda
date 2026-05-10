"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, Search, Menu, User, ChevronDown, LogOut } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import SearchModal from "@/components/shared/SearchModal";
import { useCart } from "@/lib/CartContext";
import { storeApi } from "@/lib/api";



export default function Header() {
  const router = useRouter();
  const { items, itemCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    // Fetch collections
    const fetchCollections = async () => {
      try {
        const categories = await storeApi.getCategories();
        // Here we can use categories as collections or fetch separate collections if needed
        // For now, let's treat top-level categories as "collections" or fetch real campaigns
        const banners = await storeApi.getBanners();
        if (banners.length > 0) {
           setCollections(banners.map(b => ({ slug: b.id, title: b.title })));
        } else {
           setCollections(categories.map(c => ({ slug: c.slug, title: c.name })));
        }
      } catch (err) {
        console.error('Header collections fetch failed', err);
      }
    };
    fetchCollections();

    // Check auth status
    setIsLoggedIn(storeApi.isLoggedIn());
    setUser(storeApi.getUser());

    // Keyboard shortcut for search
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    storeApi.logout();
    setIsLoggedIn(false);
    setUser(null);
    router.push('/');
  };

  return (
    <motion.header
      className={`fixed top-0 w-full z-50 transition-all duration-500 border-b ${isScrolled
        ? 'bg-white/30 backdrop-blur-md shadow-sm border-white/20 py-3'
        : 'bg-transparent border-transparent py-5'
        }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
        {/* Mobile Menu */}
        <Menu className={`w-6 h-6 md:hidden cursor-pointer ${isScrolled ? 'text-stone-900' : 'text-white'}`} />

        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <h1 className={`text-2xl md:text-3xl font-serif font-bold tracking-tight bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-90'}`}>
            PEYKER MODA
          </h1>
        </Link>

        {/* Desktop Nav */}
        <nav className={`hidden md:flex items-center gap-8 text-sm font-medium tracking-wide ${isScrolled ? 'text-stone-700' : 'text-white'}`}>
          <Link href="/" className="hover:text-amber-500 transition-colors relative group">Ana Sayfa</Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="hover:text-amber-500 transition-colors flex items-center gap-1 focus:outline-none">
              Koleksiyonlar <ChevronDown className="w-4 h-4 opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-md border-stone-100">
              <DropdownMenuItem asChild>
                <Link href="/koleksiyonlar/cok-satanlar" className="cursor-pointer w-full font-semibold text-amber-600">
                  ★ Çok Satanlar
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {collections.map((collection) => (
                <DropdownMenuItem key={collection.slug} asChild>
                  <Link href={`/koleksiyonlar/${collection.slug}`} className="cursor-pointer w-full">
                    {collection.title}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/giyim" className="hover:text-amber-500 transition-colors relative group">Giyim</Link>
          <Link href="/aksesuar" className="hover:text-amber-500 transition-colors relative group">Aksesuar</Link>
          <Link href="/indirim" className="hover:text-amber-500 transition-colors relative group font-semibold text-rose-500 hover:text-rose-600">İndirim</Link>
        </nav>

        {/* Icons */}
        <div className={`flex items-center gap-3 md:gap-5 ${isScrolled ? 'text-stone-900' : 'text-white'}`}>
          <button onClick={() => setIsSearchOpen(true)} className="hover:text-amber-500 transition-colors hidden sm:block">
            <Search className="w-5 h-5" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="hover:text-amber-500 transition-colors focus:outline-none flex items-center gap-2">
              <User className="w-5 h-5" />
              <span className="hidden lg:inline text-sm font-medium">
                {isLoggedIn ? user?.firstName || 'Hesabım' : 'Giriş'}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-md border-stone-850">
              {isLoggedIn ? (
                <>
                  <DropdownMenuLabel>Merhaba, {user?.firstName || 'Kullanıcı'}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profil" className="cursor-pointer w-full font-semibold">
                      Profilim
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profil?tab=orders" className="cursor-pointer w-full font-semibold">
                      Siparişlerim
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">Favorilerim</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-rose-600 focus:text-rose-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Çıkış Yap
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel>Hesap</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/giris" className="cursor-pointer w-full font-semibold">
                      Giriş Yap
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/kayit" className="cursor-pointer w-full">
                      Kayıt Ol
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/siparis-takip" className="cursor-pointer w-full text-stone-500">
                      Sipariş Takip
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/sepet" className="relative cursor-pointer hover:text-amber-500 transition-colors">
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </motion.header>
  );
}