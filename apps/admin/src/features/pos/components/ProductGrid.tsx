import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { usePos } from "@/context/PosContext";
import { toast } from "sonner";
import { posService, PosProduct } from "../services/pos.service";
import { cn } from "@/lib/utils";

interface PosCategory {
  name: string;
}

export const PosProductGrid = () => {
  const { addToCart, cart } = usePos();
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Hepsi");
  const [categories, setCategories] = useState<string[]>(["Hepsi"]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          posService.getProducts(),
          posService.getCategories(),
        ]);
        setProducts(productsData || []);
        const catNames = categoriesData?.map((c: PosCategory) => c.name) || [];
        setCategories(["Hepsi", ...catNames]);
      } catch (err) {
        console.error("POS products fetch error:", err);
        toast.error("Ürünler yüklenemedi");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.includes(searchTerm);
    const matchesCategory =
      activeCategory === "Hepsi" || product.categoryName === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: PosProduct) => {
    if (product.stock <= 0) {
      toast.error("Bu ürün stokta yok!");
      return;
    }

    const existingQuantity =
      cart.find(
        (item) => item.variantId === product.id && item.lineType === "SALE",
      )?.quantity ?? 0;
    if (existingQuantity >= product.stock) {
      toast.warning(`Stok sınırı: ${product.stock}`);
      return;
    }

    addToCart({
      id: product.id,
      variantId: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      image: product.image,
    });
    toast.success(`${product.name} eklendi`, {
      duration: 1200,
      position: "top-center",
      className: "font-medium py-3 px-4 shadow-xl border-zinc-200",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
        <p className="text-sm font-medium text-zinc-500">
          Ürünler Yükleniyor...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-50">
      {/* Search & Categories */}
      <div className="p-5 border-b border-zinc-200/80 bg-white space-y-5">
        <div className="relative max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            placeholder="Ürün adı, barkod (F2) veya SKU ara..."
            className="w-full h-11 pl-10 pr-4 bg-zinc-50 border border-zinc-200/80 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-zinc-900 placeholder:text-zinc-400 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-lg text-[13px] font-semibold whitespace-nowrap transition-all shadow-sm border",
                  isActive
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-zinc-600 border-zinc-200/80 hover:bg-zinc-50 hover:text-zinc-900",
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= 5;

            return (
              <div
                key={product.id}
                className={cn(
                  "group flex flex-col bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm transition-all duration-200",
                  isOutOfStock
                    ? "opacity-60 grayscale-[0.8] cursor-not-allowed"
                    : "cursor-pointer hover:shadow-md hover:border-zinc-300 active:scale-[0.98]",
                )}
                onClick={() => !isOutOfStock && handleAddToCart(product)}
              >
                <div className="aspect-[4/5] bg-zinc-100 relative overflow-hidden">
                  <img
                    src={product.image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400&auto=format&fit=crop"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />

                  {/* Stock Indicators */}
                  <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 items-end shadow-sm">
                    {isOutOfStock ? (
                      <span className="bg-red-500/90 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm uppercase tracking-wider">
                        Tükendi
                      </span>
                    ) : isLowStock ? (
                      <span className="bg-amber-500/90 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm uppercase tracking-wider">
                        Son {product.stock}
                      </span>
                    ) : null}
                  </div>

                  {/* Action overlay (visible on hover) */}
                  {!isOutOfStock && (
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-end">
                      <div className="w-full bg-white/95 backdrop-blur-sm text-zinc-900 text-xs font-bold py-2 rounded-lg text-center shadow-lg">
                        Sepete Ekle
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3.5 flex flex-col flex-1 justify-between bg-white border-t border-zinc-100 relative z-10">
                  <h3 className="text-[13px] font-semibold text-zinc-800 line-clamp-2 leading-snug mb-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] font-black text-zinc-900 tracking-tight">
                      {product.price.toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      ₺
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
            <div className="w-16 h-16 bg-white border border-zinc-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <Search className="w-6 h-6 text-zinc-400" />
            </div>
            <h3 className="text-zinc-900 font-bold mb-1.5">Ürün Bulunamadı</h3>
            <p className="text-zinc-500 text-sm font-medium">
              Arama kriterlerinize uygun bir ürün stokta yer almıyor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
