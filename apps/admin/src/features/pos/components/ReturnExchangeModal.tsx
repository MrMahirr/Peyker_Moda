import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, RotateCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePos } from '@/context/PosContext';
import { Modal } from '@/components/ui/Modal';
import { ordersService } from '@/features/sales/services/orders.service';

interface ReturnExchangeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface OrderItem {
    id: string;
    variantId: string;
    quantity: number;
    unitPrice: number | string;
    total: number | string;
    variant?: {
        id?: string;
        size?: string | null;
        color?: string | null;
        product?: {
            name?: string;
        };
    };
}

interface OrderDetail {
    id: string;
    orderNumber: string;
    createdAt: string;
    customer?: {
        firstName?: string;
        lastName?: string;
    };
    items?: OrderItem[];
}

export const ReturnExchangeModal = ({ isOpen, onClose }: ReturnExchangeModalProps) => {
    const { addReturnItem } = usePos();
    const [searchQuery, setSearchQuery] = useState('');
    const [foundOrder, setFoundOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery) {
            toast.error('Lutfen bir fis numarasi giriniz.', { className: 'font-medium' });
            return;
        }

        setLoading(true);
        try {
            const result = await ordersService.getAll({ search: searchQuery, limit: 1 });
            const order = result.data?.[0];
            if (!order) {
                setFoundOrder(null);
                toast.error('Siparis bulunamadi.', { className: 'font-medium' });
                return;
            }

            const detail = await ordersService.getById(order.id);
            setFoundOrder(detail as OrderDetail);
        } catch (err) {
            console.error('Order search error:', err);
            setFoundOrder(null);
            toast.error('Siparis sorgulanamadi.', { className: 'font-medium' });
        } finally {
            setLoading(false);
        }
    };

    const getItemName = (item: OrderItem) => {
        const base = item.variant?.product?.name || 'Urun';
        const variantInfo = [item.variant?.size, item.variant?.color].filter(Boolean).join(' / ');
        return variantInfo ? `${base} (${variantInfo})` : base;
    };

    const getItemPrice = (item: OrderItem) => {
        const unitPrice = Number(item.unitPrice ?? 0);
        if (Number.isFinite(unitPrice) && unitPrice > 0) {
            return unitPrice;
        }
        const total = Number(item.total ?? 0);
        return total && item.quantity ? total / item.quantity : 0;
    };

    const handleAddToReturn = (item: OrderItem) => {
        const price = getItemPrice(item);
        addReturnItem({
            id: item.variantId || item.id,
            name: getItemName(item),
            price,
        });
        toast.success('Urun iade sepetine eklendi.', { className: 'font-medium' });
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Iade & Degisim Islemleri"
            size="lg"
            className="p-0 overflow-hidden h-[600px] flex flex-col"
        >
            <div className="p-5 border-b border-zinc-200/80 bg-zinc-50/50">
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder="Fis Numarasi Giriniz"
                            className="pl-10 h-11 bg-white border-zinc-200/80"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <Button variant="primary" onClick={handleSearch} className="h-11 px-6" loading={loading}>
                        Sorgula
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 bg-white">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <Loader2 className="h-6 w-6 animate-spin text-zinc-900" />
                        <p className="text-zinc-500 text-sm font-medium mt-3">Siparis aranıyor...</p>
                    </div>
                ) : foundOrder ? (
                    <div className="space-y-6">
                        <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-200/80 shadow-sm">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[13px] font-medium text-zinc-500 uppercase tracking-widest">Siparis Ozeti</span>
                                <span className="text-[13px] font-semibold text-zinc-900 border border-zinc-200 bg-white px-2.5 py-1 rounded-md shadow-sm">
                                    Fis No: {foundOrder.orderNumber}
                                </span>
                            </div>
                            <div className="text-xl font-bold text-zinc-900 mt-2">
                                {foundOrder.customer ? `${foundOrder.customer.firstName || ''} ${foundOrder.customer.lastName || ''}`.trim() : 'Musteri'}
                            </div>
                            <div className="text-sm font-medium text-zinc-500 mt-1">{new Date(foundOrder.createdAt).toLocaleString('tr-TR')}</div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-semibold text-zinc-900 text-[15px] px-1">Siparis Icerigi</h3>
                            {foundOrder.items?.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 bg-white p-3.5 rounded-xl border border-zinc-200/80 hover:border-indigo-200 transition-colors shadow-sm">
                                    <div className="flex-1">
                                        <div className="font-semibold text-[14px] text-zinc-900 leading-snug">{getItemName(item)}</div>
                                        <div className="text-zinc-900 font-bold text-[15px] mt-1">
                                            {getItemPrice(item).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-amber-600 border-amber-200 bg-amber-50/50 hover:bg-amber-100 font-bold px-4"
                                        onClick={() => handleAddToReturn(item)}
                                    >
                                        <RotateCcw className="h-4 w-4 mr-2 text-amber-500" />
                                        Iade Al
                                    </Button>
                                </div>
                            )) || (
                                <p className="text-zinc-500">Urun bilgisi yok</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-zinc-50 border border-zinc-200/80 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                            <Search className="h-6 w-6 text-zinc-400" />
                        </div>
                        <h3 className="text-zinc-900 font-bold mb-1.5">Siparis Bekleniyor</h3>
                        <p className="text-zinc-500 text-sm font-medium max-w-xs">Iade veya degisim islemi yapmak icin yukaridan fis numarasi ile sorgulatin.</p>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-zinc-200/80 bg-zinc-50/50 flex justify-end">
                <Button variant="secondary" onClick={onClose} className="px-6 font-semibold bg-white border border-zinc-200/80 shadow-sm text-zinc-700">
                    Kapat
                </Button>
            </div>
        </Modal>
    );
};
