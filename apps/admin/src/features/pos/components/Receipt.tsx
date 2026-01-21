import { forwardRef } from 'react';
import { CartItem } from '@/context/PosContext';

interface ReceiptProps {
    cart: CartItem[];
    total: number;
    paymentMethod: string;
    date: Date;
    receiptNo: string;
    cashierName: string;
}

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(
    ({ cart, total, paymentMethod, date, receiptNo, cashierName }, ref) => {
        return (
            <div
                ref={ref}
                id="printable-receipt"
                className="w-[80mm] bg-white text-black font-mono text-[12px] leading-tight p-2 mx-auto"
                style={{
                    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                    minHeight: '100mm' // Visual height for preview
                }}
            >
                {/* Header */}
                <div className="text-center mb-2">
                    <h1 className="text-base font-bold text-black uppercase tracking-wider">PEYKER MODA</h1>
                    <p className="text-[10px] mt-1">Bağdat Caddesi No: 123</p>
                    <p className="text-[10px]">Kadıköy / İSTANBUL</p>
                    <p className="text-[10px]">Tel: (0216) 123 45 67</p>
                    <p className="text-[10px]">Mersis: 1234567890123456</p>
                </div>

                {/* Info Block */}
                <div className="border-b border-black border-dashed my-2"></div>
                <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                        <span>Tarih:</span>
                        <span>{date.toLocaleDateString('tr-TR')} {date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Fiş No:</span>
                        <span>{receiptNo}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Kasiyer:</span>
                        <span>{cashierName}</span>
                    </div>
                </div>
                <div className="border-b border-black border-dashed my-2"></div>

                {/* Items */}
                <div className="mb-2">
                    {cart.map((item) => (
                        <div key={item.id} className="mb-1 text-[11px]">
                            <div className="font-bold truncate">{item.name}</div>
                            <div className="flex justify-between pl-2 text-[10px]">
                                <span>{item.quantity} x {item.price.toFixed(2)}</span>
                                <span>{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Totals */}
                <div className="border-t border-black border-dashed my-2 pt-2">
                    <div className="flex justify-between text-sm font-bold">
                        <span>TOPLAM:</span>
                        <span>{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
                    </div>
                    <div className="flex justify-between text-[10px] mt-1">
                        <span>KDV (%10):</span>
                        <span>{(total * 0.1).toFixed(2)} TL</span>
                    </div>
                </div>

                {/* Payment Type */}
                <div className="border-t border-black border-dashed my-2 pt-2 text-[11px]">
                    <div className="flex justify-between uppercase">
                        <span>Ödeme Tipi:</span>
                        <span>{paymentMethod === 'cash' ? 'Nakit' : paymentMethod === 'credit_card' ? 'Kredi Kartı' : 'Diğer'}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-4 text-[10px] space-y-1">
                    <p>*** İYİ GÜNLER DİLERİZ ***</p>
                    <p>Değişim için fiş ibrazı zorunludur.</p>
                    <p>Kıyafetlerde iade yoktur.</p>
                    <div className="mt-2 flex justify-center py-2 bg-white">
                        {/* Barcode Mock */}
                        <div className="flex gap-[2px] h-8 justify-center items-end opacity-80">
                            {[...Array(40)].map((_, i) => (
                                <div key={i} className={`w-[2px] bg-black ${Math.random() > 0.5 ? 'h-full' : 'h-3/4'}`} />
                            ))}
                        </div>
                        <p className="text-[9px] mt-1 tracking-[4px]">{receiptNo.replace('TR-', '')}</p>
                    </div>
                </div>
            </div>
        );
    }
);

Receipt.displayName = 'Receipt';
