import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { usePos } from '@/context/PosContext';
import { Modal } from '@/components/ui/Modal';

// Mock Order Data for search
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MOCK_ORDERS: Record<string, any> = {
    '12345': {
        id: '12345',
        date: '2024-01-20',
        customer: 'Ayşe Yılmaz',
        items: [
            { id: 'p1', name: 'Basic T-Shirt (Beyaz / M)', price: 250.00, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80' },
            { id: 'p2', name: 'Kot Pantolon (Mavi / 32)', price: 850.00, image: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=400&q=80' }
        ]
    },
    '67890': {
        id: '67890',
        date: '2024-01-21',
        customer: 'Mehmet Demir',
        items: [
            { id: 'p3', name: 'Yazlık Elbise (Kırmızı / S)', price: 1200.00, image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80' }
        ]
    }
};

interface ReturnExchangeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ReturnExchangeModal = ({ isOpen, onClose }: ReturnExchangeModalProps) => {
    const { addReturnItem } = usePos();
    const [searchQuery, setSearchQuery] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [foundOrder, setFoundOrder] = useState<any>(null);

    const handleSearch = () => {
        if (!searchQuery) {
            toast.error('Lütfen bir fiş numarası giriniz.', { className: 'font-medium' });
            return;
        }

        const order = MOCK_ORDERS[searchQuery];
        if (order) {
            setFoundOrder(order);
        } else {
            setFoundOrder(null);
            toast.error('Sipariş bulunamadı. (Örnek ref: 12345)', { className: 'font-medium' });
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleAddToReturn = (item: any) => {
        addReturnItem(item);
        toast.success(`${item.name} iade sepetine eklendi.`, { className: 'font-medium' });
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="İade & Değişim İşlemleri"
            size="lg"
            className="p-0 overflow-hidden h-[600px] flex flex-col"
        >
            <div className="p-5 border-b border-zinc-200/80 bg-zinc-50/50">
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder="Fiş Numarası Giriniz (Örn: 12345)"
                            className="pl-10 h-11 bg-white border-zinc-200/80"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <Button variant="primary" onClick={handleSearch} className="h-11 px-6">
                        Sorgula
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 bg-white">
                {foundOrder ? (
                    <div className="space-y-6">
                        <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-200/80 shadow-sm">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[13px] font-medium text-zinc-500 uppercase tracking-widest">Sipariş Özeti</span>
                                <span className="text-[13px] font-semibold text-zinc-900 border border-zinc-200 bg-white px-2.5 py-1 rounded-md shadow-sm">
                                    Fiş No: {foundOrder.id}
                                </span>
                            </div>
                            <div className="text-xl font-bold text-zinc-900 mt-2">{foundOrder.customer}</div>
                            <div className="text-sm font-medium text-zinc-500 mt-1">{foundOrder.date}</div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-semibold text-zinc-900 text-[15px] px-1">Sipariş İçeriği</h3>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {foundOrder.items.map((item: any) => (
                                <div key={item.id} className="flex items-center gap-4 bg-white p-3.5 rounded-xl border border-zinc-200/80 hover:border-indigo-200 transition-colors shadow-sm">
                                    <img src={item.image} alt={item.name} className="h-14 w-14 rounded-lg object-cover bg-zinc-100 border border-zinc-200/50" />
                                    <div className="flex-1">
                                        <div className="font-semibold text-[14px] text-zinc-900 leading-snug">{item.name}</div>
                                        <div className="text-zinc-900 font-bold text-[15px] mt-1">
                                            {item.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-amber-600 border-amber-200 bg-amber-50/50 hover:bg-amber-100 font-bold px-4"
                                        onClick={() => handleAddToReturn(item)}
                                    >
                                        <RotateCcw className="h-4 w-4 mr-2 text-amber-500" />
                                        İade Al
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-zinc-50 border border-zinc-200/80 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                            <Search className="h-6 w-6 text-zinc-400" />
                        </div>
                        <h3 className="text-zinc-900 font-bold mb-1.5">Sipariş Bekleniyor</h3>
                        <p className="text-zinc-500 text-sm font-medium max-w-xs">İade veya değişim işlemi yapmak için yukarıdan fiş numarası ile sorgulatın.</p>
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
