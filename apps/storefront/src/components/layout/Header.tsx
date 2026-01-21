"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Search, Menu, User, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { collectionsDB } from "@/lib/data";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={`fixed top-0 w-full z-50 transition-all duration-500 border-b ${
        isScrolled
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
        <nav className={`hidden md:flex items-center gap-8 text-sm font-medium tracking-wide ${isScrolled ? 'text-stone-700' : 'text-stone-850'}`}>
          <Link href="/" className="hover:text-amber-500 transition-colors relative group">Ana Sayfa</Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="hover:text-amber-500 transition-colors flex items-center gap-1 focus:outline-none">
              Koleksiyonlar <ChevronDown className="w-4 h-4 opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-md border-stone-100">

              {/* Statik Linkler (Veritabanında olmayan özel sayfalar) */}
              <DropdownMenuItem asChild>
                <Link href="/koleksiyonlar/cok-satanlar" className="cursor-pointer w-full font-semibold text-amber-600">
                  ★ Çok Satanlar
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Dinamik Linkler (Veritabanından gelenler) */}
              {Object.entries(collectionsDB).map(([slug, collection]) => (
                <DropdownMenuItem key={slug} asChild>
                  <Link href={`/koleksiyonlar/${slug}`} className="cursor-pointer w-full">
                    {collection.meta.title}
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
        <div className={`flex items-center gap-3 md:gap-5 ${isScrolled ? 'text-stone-900' : 'text-stone-850'}`}>
          <Search className="w-5 h-5 cursor-pointer hover:text-amber-500 transition-colors hidden sm:block" />

          <DropdownMenu>
            <DropdownMenuTrigger className="hover:text-amber-500 transition-colors focus:outline-none flex items-center gap-2">
              <User className="w-5 h-5" />
              <span className="hidden lg:inline text-sm font-medium">Hesabım</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-md border-stone-850">
              <DropdownMenuLabel>Merhaba, Peyker</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profil" className="cursor-pointer w-full font-semibold">
                  Profilim
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profil?tab=orders" className="cursor-pointer w-full font-semibold ">
                  Sparişlerim
                </Link>
              </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Favorilerim</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-rose-600 focus:text-rose-600">Çıkış Yap</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/sepet" className="relative cursor-pointer hover:text-amber-500 transition-colors">
            <ShoppingBag className="w-5 h-5" />
            {/* Sepet boş olsa bile badge görünebilir veya context ile dinamik yapılabilir */}
            <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">2</span>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}