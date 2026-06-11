"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { storeApi, StoreUser } from "@/lib/api";
import { CollectionLink } from "../types";

export function useHeaderState() {
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<StoreUser | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [collections, setCollections] = useState<CollectionLink[]>([]);

  const closeSearch = useCallback(() => setIsSearchOpen(false), []);
  const openSearch = useCallback(() => setIsSearchOpen(true), []);

  const logout = useCallback(() => {
    storeApi.logout();
    setIsLoggedIn(false);
    setUser(null);
    router.push("/");
  }, [router]);

  useEffect(() => {
    const initialSyncId = window.setTimeout(() => {
      setMounted(true);
      setIsLoggedIn(storeApi.isLoggedIn());
      setUser(storeApi.getUser());
      setIsScrolled(window.scrollY > 20);
    }, 0);

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        openSearch();
      }
      if (event.key === "Escape") closeSearch();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(initialSyncId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeSearch, openSearch]);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const apiCollections = await storeApi.getCollectionContent();
        if (apiCollections && apiCollections.length > 0) {
          setCollections(
            apiCollections
              .filter((collection) => collection.isActive)
              .sort((a, b) => a.position - b.position)
              .map((collection) => ({
                slug: collection.slug || "",
                title: collection.name,
              })),
          );
          return;
        }

        const categories = await storeApi.getCategories();
        setCollections(
          categories.map((category) => ({
            slug: category.slug,
            title: category.name,
          })),
        );
      } catch (error) {
        console.error("Header collections fetch failed", error);
      }
    };

    fetchCollections();
  }, []);

  const isHomePage = pathname === "/";
  const shouldApplyScrolledStyle = isScrolled || !isHomePage;

  return {
    mounted,
    isLoggedIn,
    user,
    isSearchOpen,
    openSearch,
    closeSearch,
    logout,
    collections,
    shouldApplyScrolledStyle,
  };
}
