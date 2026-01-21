import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Search, RotateCcw, X } from 'lucide-react';
import { toast } from 'sonner';
import { usePos } from '@/context/PosContext';

// Mock Order Data for search
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
    const [foundOrder, setFoundOrder] = useState<any>(null);

    if (!isOpen) return null;

    const handleSearch = () => {
        if (!searchQuery) {
            toast.error('Lütfen bir fiş numarası giriniz.');
            return;
        }

        const order = MOCK_ORDERS[searchQuery];
        if (order) {
            setFoundOrder(order);
            toast.success('Sipariş bulundu.');
        } else {
            setFoundOrder(null);
            toast.error('Sipariş bulunamadı. (Örnek: 12345)');
        }
    };

    const handleAddToReturn = (item: any) => {
        addReturnItem(item);
        toast.success(`${item.name} iade sepetine eklendi.`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-2xl p-0 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 h-[600px] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-2">
                        <RotateCcw className="h-5 w-5 text-indigo-600" />
                        <h2 className="text-lg font-bold text-slate-900">İade & Değişim İşlemleri</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 border-b border-slate-100 bg-white">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Fiş Numarası Giriniz (Örn: 12345)"
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <Button onClick={handleSearch}>
                            Sorgula
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
                    {foundOrder ? (
                        <div className="space-y-4">
                            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                <div className="flex justify-between text-sm text-slate-500 mb-2">
                                    <span>Fiş No: <b>{foundOrder.id}</b></span>
                                    <span>Tarih: {foundOrder.date}</span>
                                </div>
                                <div className="font-medium text-slate-900">{foundOrder.customer}</div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-semibold text-slate-900 text-sm px-1">Sipariş İçeriği</h3>
                                {foundOrder.items.map((item: any) => (
                                    <div key={item.id} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors">
                                        <img src={item.image} alt={item.name} className="h-12 w-12 rounded object-cover bg-slate-100" />
                                        <div className="flex-1">
                                            <div className="font-medium text-sm text-slate-900">{item.name}</div>
                                            <div className="text-indigo-600 font-bold text-sm">
                                                {item.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                            onClick={() => handleAddToReturn(item)}
                                        >
                                            <RotateCcw className="h-3 w-3 mr-2" />
                                            İade Al
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <Search className="h-12 w-12 mb-4 opacity-20" />
                            <p>İade işlemi yapmak için fiş numarası ile sorgulama yapın.</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-200 bg-white flex justify-end">
                    <Button variant="ghost" onClick={onClose}>
                        Kapat
                    </Button>
                </div>
            </Card>
        </div>
    );
};
