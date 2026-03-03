import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, CreditCard, Wallet, Banknote, CheckCircle2, Printer, ArrowRight } from 'lucide-react';
import { usePos } from '@/context/PosContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Receipt } from './Receipt';
import { posService } from '../services/pos.service';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    total: number;
}

type PaymentMethod = 'cash' | 'credit_card' | 'iban';

export const PaymentModal = ({ isOpen, onClose, total }: PaymentModalProps) => {
    const { cart, clearCart } = usePos();
    const { user } = useAuth();
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
    const [receivedAmount, setReceivedAmount] = useState<string>('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Store a snapshot of the cart for the receipt
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [receiptCart, setReceiptCart] = useState<any[]>([]);
    const [receiptNo, setReceiptNo] = useState('');

    useEffect(() => {
        if (isOpen) {
            setReceivedAmount('');
            setIsSuccess(false);
            setProcessing(false);
            setPaymentMethod('cash');
            setReceiptCart(cart);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    if (!isOpen) return null;

    const handleComplete = async () => {
        setProcessing(true);

        try {
            // Map cart items to API format
            const saleData = {
                items: cart.map(item => ({
                    variantId: item.variantId || item.id,
                    quantity: item.quantity,
                    unitPrice: item.price,
                })),
                paymentMethod: paymentMethod === 'cash' ? 'CASH' as const :
                    paymentMethod === 'credit_card' ? 'CARD' as const : 'CASH' as const,
                cashAmount: paymentMethod === 'cash' ? Number(receivedAmount) || total : undefined,
                notes: `POS Sale - ${new Date().toLocaleString('tr-TR')}`,
            };

            const result = await posService.createSale(saleData);

            setIsSuccess(true);
            setReceiptNo(result.saleNumber || `TR-${Math.floor(Math.random() * 100000)}`);
            setReceiptCart(cart);

            toast.success(`Ödeme Başarılı: ${total.toLocaleString('tr-TR')} ₺`);
            clearCart();
        } catch (error) {
            console.error('Sale creation failed:', error);
            toast.error('Satış kaydedilemedi. Lütfen tekrar deneyin.');
        } finally {
            setProcessing(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleClose = () => {
        onClose();
    };

    const change = Math.max(0, Number(receivedAmount) - total);

    if (isSuccess) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-hidden">
                <Card className="w-full max-w-lg h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 bg-slate-100">

                    {/* Success Header */}
                    <div className="bg-white p-6 pb-4 text-center border-b border-slate-200 shrink-0">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 text-green-600">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Ödeme Başarılı!</h2>
                        <p className="text-sm text-slate-500">Satış tamamlandı.</p>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <Button variant="outline" onClick={handlePrint} className="h-10 border-slate-300 hover:bg-slate-50">
                                <Printer className="mr-2 h-4 w-4" />
                                Yazdır
                            </Button>
                            <Button onClick={handleClose} className="h-10 bg-indigo-600 hover:bg-indigo-700">
                                Yeni Satış <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Receipt Preview Area (Scrollable) */}
                    <div className="flex-1 overflow-y-auto p-4 bg-slate-200/50 flex flex-col items-center">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Fiş Önizleme</p>

                        <div className="shadow-lg rounded-sm overflow-hidden pointer-events-none select-none origin-top transition-transform">
                            <Receipt
                                cart={receiptCart}
                                total={total}
                                paymentMethod={paymentMethod}
                                date={new Date()}
                                receiptNo={receiptNo}
                                cashierName={user?.name || 'Kasiyer'}
                            />
                        </div>
                    </div>

                </Card>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-2xl p-0 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
                    <h2 className="text-lg font-bold text-slate-900">Ödeme Al</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row h-[500px]">
                    {/* Left: Payment Methods */}
                    <div className="w-full md:w-1/3 border-r border-slate-200 bg-slate-50 p-4 space-y-3">
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Ödeme Yöntemi</p>

                        <button
                            onClick={() => setPaymentMethod('cash')}
                            className={`nav-button w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all ${paymentMethod === 'cash'
                                ? 'bg-white text-indigo-600 shadow ring-1 ring-indigo-200'
                                : 'text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            <Banknote className="h-5 w-5" />
                            Nakit
                        </button>

                        <button
                            onClick={() => setPaymentMethod('credit_card')}
                            className={`nav-button w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all ${paymentMethod === 'credit_card'
                                ? 'bg-white text-indigo-600 shadow ring-1 ring-indigo-200'
                                : 'text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            <CreditCard className="h-5 w-5" />
                            Kredi Kartı
                        </button>

                        <button
                            onClick={() => setPaymentMethod('iban')}
                            className={`nav-button w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all ${paymentMethod === 'iban'
                                ? 'bg-white text-indigo-600 shadow ring-1 ring-indigo-200'
                                : 'text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            <Wallet className="h-5 w-5" />
                            Havale / EFT
                        </button>
                    </div>

                    {/* Right: Payment Details */}
                    <div className="flex-1 p-6 flex flex-col">
                        <div className="mb-8 text-center">
                            <p className="text-sm text-slate-500 mb-1">Toplam Tutar</p>
                            <div className="text-4xl font-bold text-slate-900">
                                {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                            </div>
                        </div>

                        <div className="flex-1">
                            {paymentMethod === 'cash' && (
                                <div className="space-y-4">
                                    <Input
                                        label="Alınan Tutar"
                                        placeholder="0.00"
                                        className="text-lg"
                                        value={receivedAmount}
                                        onChange={(e) => setReceivedAmount(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="grid grid-cols-4 gap-2 mb-4">
                                        {[10, 20, 50, 100, 200].map((amount) => (
                                            <button
                                                key={amount}
                                                onClick={() => setReceivedAmount(amount.toString())}
                                                className="py-2 px-1 bg-slate-100 rounded text-sm font-medium hover:bg-slate-200 transition-colors"
                                            >
                                                {amount}₺
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setReceivedAmount(total.toFixed(2))}
                                            className="py-2 px-1 bg-indigo-50 text-indigo-700 rounded text-sm font-medium hover:bg-indigo-100 transition-colors col-span-2"
                                        >
                                            Tam Tutar
                                        </button>
                                    </div>

                                    <div className="p-4 bg-slate-100 rounded-lg flex justify-between items-center">
                                        <span className="font-medium text-slate-700">Para Üstü</span>
                                        <span className="font-bold text-xl text-emerald-600">
                                            {change.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                                        </span>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'credit_card' && (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center animate-pulse">
                                        <CreditCard className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">POS Cihazından İşlem Bekleniyor</p>
                                        <p className="text-sm text-slate-500">Lütfen kartı okutunuz.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-auto pt-6 border-t border-slate-100">
                            <Button
                                size="lg"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg"
                                onClick={handleComplete}
                            >
                                Ödemeyi Tamamla
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};
