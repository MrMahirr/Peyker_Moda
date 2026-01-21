import { useState } from 'react';
import { PosProductGrid } from './components/ProductGrid';
import { PaymentModal } from './components/PaymentModal';
import { ReturnExchangeModal } from './components/ReturnExchangeModal';
import { ShoppingCart, X, Plus, Minus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { usePos } from '@/context/PosContext';
import { toast } from 'sonner';
import { swal } from '@/utils/swal';
import { usePosHotkeys } from './hooks/usePosHotkeys';

export const PosPage = () => {
    const { cart, removeFromCart, updateQuantity, clearCart, totals, addToCart } = usePos();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

    // For handling focus via F2
    // Ideally ProductGrid should expose a ref or handle this, but for now we'll simulate or pass it down.
    // Since ProductGrid is a separate component, I'll pass a prop or just focus the first input found (hacky but works for verified setup).
    // Better: Pass a ref to PosProductGrid if possible, or just focus document.querySelector('input')

    usePosHotkeys({
        onSearchFocus: () => {
            const searchInput = document.querySelector('input[placeholder*="Ara"]') as HTMLInputElement;
            if (searchInput) {
                searchInput.focus();
                toast.info('Arama odaklandı (F2)');
            }
        },
        onPayment: () => {
            if (cart.length > 0) {
                setIsPaymentModalOpen(true);
            } else {
                toast.warning('Sepet boş!');
            }
        },
        onBarcodeScanned: (barcode) => {
            // Mock barcode lookup
            // In a real app, you'd search the product by barcode
            console.log('Barcode:', barcode);
            // Example: If barcode matches a known product, add it
            if (barcode === '12345678') {
                // Mock add product
                addToCart({
                    id: 'barcode-product-1',
                    name: 'Barkodlu Ürün (Test)',
                    price: 150.00,
                    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80'
                });
                toast.success('Ürün Eklendi: Barkodlu Ürün (Test)');
            } else {
                toast.error(`Ürün bulunamadı: ${barcode}`);
            }
        }
    });

    return (
        <div className="flex h-full">
            {/* Left Side: Product Grid (65-70%) */}
            <div className="w-[70%] h-full">
                <PosProductGrid />
            </div>

            {/* Right Side: Cart (30-35%) */}
            <div className="w-[30%] h-full bg-white flex flex-col border-l border-slate-200 shadow-xl z-20">
                {/* Cart Header */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-indigo-600" />
                        <h2 className="font-semibold text-slate-900">Sepet ({cart.length})</h2>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                            onClick={() => setIsReturnModalOpen(true)}
                        >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            İade/Değişim
                        </Button>
                        {cart.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => {
                                    if (cart.length === 0) return;

                                    swal.fire({
                                        title: 'Sepeti Temizle?',
                                        text: 'Tüm ürünler sepetten çıkarılacak.',
                                        icon: 'warning',
                                        showCancelButton: true,
                                        confirmButtonText: 'Evet, Temizle',
                                        cancelButtonText: 'Vazgeç'
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            clearCart();
                                            toast.info('Sepet temizlendi.');
                                        }
                                    });
                                }}
                            >
                                Temizle
                            </Button>
                        )}
                    </div>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                            <div className="bg-slate-100 p-4 rounded-full mb-4">
                                <ShoppingCart className="h-8 w-8 text-slate-300" />
                            </div>
                            <p>Sepetiniz boş.</p>
                            <p className="text-sm">Ürün eklemek için listeyi kullanın.</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="flex gap-3 bg-white border border-slate-100 hover:border-indigo-100 rounded-lg p-3 shadow-sm transition-colors group">
                                {item.image && (
                                    <img src={item.image} alt={item.name} className="h-16 w-16 object-cover rounded-md bg-slate-200" />
                                )}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-medium text-slate-900 text-sm line-clamp-2">{item.name}</h4>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
                                        <div className="text-indigo-600 font-bold text-sm">
                                            {(item.price * item.quantity).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                        </div>

                                        <div className="flex items-center gap-1 bg-slate-100 rounded-md p-0.5">
                                            <button
                                                className="w-6 h-6 flex items-center justify-center rounded bg-white shadow-sm text-slate-600 hover:text-indigo-600 disabled:opacity-50"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                                            <button
                                                className="w-6 h-6 flex items-center justify-center rounded bg-white shadow-sm text-slate-600 hover:text-indigo-600"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Cart Footer / Totals */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-4">
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Ara Toplam</span>
                            <span>{totals.subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">KDV (%10)</span>
                            <span>{totals.tax.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
                            <span>TOPLAM</span>
                            <span className="text-indigo-600">{totals.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                        </div>
                    </div>

                    <Button
                        className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 text-lg shadow-lg shadow-indigo-200"
                        size="lg"
                        disabled={cart.length === 0}
                        onClick={() => setIsPaymentModalOpen(true)}
                    >
                        ÖDEME AL
                    </Button>
                </div>
            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                total={totals.total}
            />
            <ReturnExchangeModal
                isOpen={isReturnModalOpen}
                onClose={() => setIsReturnModalOpen(false)}
            />
        </div>
    );
};
