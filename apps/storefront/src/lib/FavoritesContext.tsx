'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { storeApi } from '@/lib/api';

interface FavoritesContextType {
    favorites: string[];
    toggleFavorite: (id: string, name?: string) => Promise<void>;
    isFavorite: (id: string) => boolean;
    loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
    const [favorites, setFavorites] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initFavorites = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const favProducts = await storeApi.getFavorites();
                setFavorites(favProducts.map((p: any) => String(p.id)));
            } catch (error) {
                console.error("Failed to fetch favorites:", error);
            } finally {
                setLoading(false);
            }
        };
        initFavorites();
    }, []);

    const toggleFavorite = async (id: string, name?: string) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            toast.error('Favorilere eklemek için giriş yapmalısınız.');
            return;
        }

        const currentlyFavorite = favorites.includes(id);

        if (currentlyFavorite) {
            // Remove
            const success = await storeApi.removeFavorite(id);
            if (success) {
                setFavorites(prev => prev.filter(favId => favId !== id));
                toast.info(`${name || 'Ürün'} favorilerden çıkarıldı.`);
            } else {
                toast.error('Favorilerden çıkarılırken bir hata oluştu.');
            }
        } else {
            // Add
            const success = await storeApi.addFavorite(id);
            if (success) {
                setFavorites(prev => [...prev, id]);
                toast.success(`${name || 'Ürün'} favorilere eklendi!`);
            } else {
                toast.error('Favorilere eklenirken bir hata oluştu.');
            }
        }
    };

    const isFavorite = (id: string) => favorites.includes(String(id));

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, loading }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
    return context;
};
