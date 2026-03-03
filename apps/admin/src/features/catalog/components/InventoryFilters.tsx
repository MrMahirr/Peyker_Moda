import { Search, Filter, ArrowUpDown, CheckSquare, ChevronDown } from 'lucide-react';

export const InventoryFilters = () => {
    return (
        <div className="bg-surface rounded-xl border border-zinc-200/80 p-2 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-2">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="relative min-w-[260px] sm:min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                        <input
                            className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200/50 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-zinc-900 placeholder:text-zinc-400 transition-all font-medium"
                            placeholder="Ürünlerde ara..."
                            type="text"
                        />
                    </div>

                    {/* Filter Chips */}
                    <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0 hide-scrollbar">
                        <button className="flex h-9 items-center gap-1.5 rounded-lg bg-zinc-900 text-white px-3.5 text-[13px] font-medium border border-zinc-900 whitespace-nowrap shadow-sm">
                            Tüm Ürünler
                        </button>
                        <button className="flex h-9 items-center gap-1.5 rounded-lg bg-white px-3.5 text-[13px] font-medium text-zinc-600 hover:bg-zinc-50 border border-zinc-200/80 transition-colors whitespace-nowrap shadow-sm">
                            Elbiseler
                            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                        </button>
                        <button className="flex h-9 items-center gap-1.5 rounded-lg bg-white px-3.5 text-[13px] font-medium text-zinc-600 hover:bg-zinc-50 border border-zinc-200/80 transition-colors whitespace-nowrap shadow-sm">
                            Dış Giyim
                            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                        </button>
                        <button className="flex h-9 items-center gap-1.5 rounded-lg bg-white px-3.5 text-[13px] font-medium text-zinc-600 hover:bg-zinc-50 border border-zinc-200/80 transition-colors whitespace-nowrap shadow-sm">
                            Aksesuarlar
                            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                        </button>
                    </div>
                </div>

                {/* Toolbar Actions */}
                <div className="flex gap-1.5 self-end lg:self-auto">
                    <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-colors border border-transparent hover:border-zinc-200">
                        <Filter className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-colors border border-transparent hover:border-zinc-200">
                        <ArrowUpDown className="w-4 h-4" />
                    </button>
                    <div className="h-6 w-[1px] bg-zinc-200 mx-1.5 self-center"></div>
                    <button className="flex items-center justify-center gap-2 rounded-lg h-9 px-3.5 bg-white text-zinc-700 text-[13px] font-medium border border-zinc-200/80 hover:bg-zinc-50 transition-colors shadow-sm">
                        <CheckSquare className="w-4 h-4 text-zinc-400" />
                        <span>Toplu İşlem</span>
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                    </button>
                </div>
            </div>
        </div>
    );
};
