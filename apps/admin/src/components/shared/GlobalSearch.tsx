import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Package, Users, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '@/features/dashboard/services/dashboard.service';
import { cn } from '@/lib/utils';

interface SearchResult {
    products: any[];
    orders: any[];
    customers: any[];
}

export const GlobalSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!query || query.trim().length < 2) {
            setResults(null);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            try {
                const data = await dashboardService.globalSearch(query);
                setResults(data);
                setIsOpen(true);
            } catch (error) {
                console.error('Search failed', error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchResults();
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [query]);

    const handleNavigate = (path: string) => {
        navigate(path);
        setIsOpen(false);
        setQuery('');
    };

    const hasResults = results && (results.products.length > 0 || results.orders.length > 0 || results.customers.length > 0);

    return (
        <div className="relative hidden md:block z-50" ref={dropdownRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => { if (hasResults) setIsOpen(true); }}
                placeholder="Hızlı arama... (Min 2 karakter)"
                className="h-10 w-72 pl-10 pr-4 rounded-xl border border-zinc-200 bg-zinc-50 text-[13px] font-semibold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all focus:bg-white shadow-sm"
            />
            {loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                </div>
            )}

            {/* Dropdown */}
            {isOpen && query.length >= 2 && !loading && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden max-h-[400px] overflow-y-auto">
                    {!hasResults ? (
                        <div className="p-4 text-center text-sm font-medium text-zinc-500">
                            Sonuç bulunamadı
                        </div>
                    ) : (
                        <div className="py-2">
                            {results?.products?.length > 0 && (
                                <div className="mb-2">
                                    <h3 className="px-3 py-1 text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <Package className="w-3.5 h-3.5" /> Ürünler
                                    </h3>
                                    {results.products.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => handleNavigate(`/catalog/${p.id}`)}
                                            className="w-full text-left px-3 py-2 hover:bg-zinc-50 flex items-center justify-between group transition-colors"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-bold text-zinc-900 group-hover:text-primary transition-colors">{p.name}</span>
                                                <span className="text-[11px] font-medium text-zinc-500">SKU: {p.sku}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {results?.orders?.length > 0 && (
                                <div className="mb-2">
                                    <h3 className="px-3 py-1 text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 border-t border-zinc-100 pt-3">
                                        <ShoppingBag className="w-3.5 h-3.5" /> Siparişler
                                    </h3>
                                    {results.orders.map(o => (
                                        <button
                                            key={o.id}
                                            onClick={() => handleNavigate(`/sales/orders/${o.id}`)}
                                            className="w-full text-left px-3 py-2 hover:bg-zinc-50 flex flex-col transition-colors group"
                                        >
                                            <span className="text-[13px] font-bold text-zinc-900 group-hover:text-primary transition-colors">{o.orderNumber}</span>
                                            <span className="text-[11px] font-medium text-zinc-500">
                                                {o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : 'Kayıtsız Müşteri'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {results?.customers?.length > 0 && (
                                <div>
                                    <h3 className="px-3 py-1 text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 border-t border-zinc-100 pt-3">
                                        <Users className="w-3.5 h-3.5" /> Müşteriler
                                    </h3>
                                    {results.customers.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => handleNavigate(`/crm/${c.id}`)}
                                            className="w-full text-left px-3 py-2 hover:bg-zinc-50 flex flex-col transition-colors group"
                                        >
                                            <span className="text-[13px] font-bold text-zinc-900 group-hover:text-primary transition-colors">
                                                {c.firstName} {c.lastName}
                                            </span>
                                            <span className="text-[11px] font-medium text-zinc-500">{c.phone || c.email || 'İletişim bilgisi yok'}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
