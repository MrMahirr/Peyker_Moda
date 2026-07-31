import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Pause, Play, Trash, ShoppingBag } from 'lucide-react';
import type { ParkSale } from '../types';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);

interface ParkedSalesProps {
    parkedSales: ParkSale[];
    onResume: (sale: ParkSale) => void;
    onDelete: (id: string) => void;
}

export const ParkedSales = ({ parkedSales, onResume, onDelete }: ParkedSalesProps) => {
    if (parkedSales.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <Pause className="w-10 h-10 text-zinc-300 mb-3" />
                <p className="text-[14px] font-semibold text-zinc-500">Park edilen satış yok</p>
                <p className="text-[12px] text-zinc-400 mt-1">Satışları askıya alarak daha sonra tamamlayabilirsiniz.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-zinc-900 text-[15px]">Park Edilen Satışlar</h3>
                <Badge variant="neutral">{parkedSales.length} adet</Badge>
            </div>
            {parkedSales.map((sale) => (
                <div
                    key={sale.id}
                    className="bg-white rounded-xl border border-zinc-200/80 p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4 text-zinc-400" />
                            <span className="font-semibold text-[13px] text-zinc-800">
                                {sale.customerName || 'Anonim Müşteri'}
                            </span>
                        </div>
                        <span className="text-[11px] text-zinc-400">
                            {new Date(sale.parkedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>

                    <div className="space-y-1 mb-3">
                        {sale.items.slice(0, 3).map((item, i) => (
                            <div key={i} className="flex justify-between text-[12px] text-zinc-600">
                                <span>{item.productName} x{item.quantity}</span>
                                <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                        ))}
                        {sale.items.length > 3 && (
                            <p className="text-[11px] text-zinc-400">+{sale.items.length - 3} ürün daha</p>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                        <span className="font-bold text-[15px] text-zinc-900">{formatCurrency(sale.totalAmount)}</span>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:bg-red-50 h-8 px-2"
                                onClick={() => onDelete(sale.id)}
                            >
                                <Trash className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                size="sm"
                                className="font-semibold h-8"
                                icon={<Play className="h-3.5 w-3.5" />}
                                onClick={() => onResume(sale)}
                            >
                                Devam Et
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
