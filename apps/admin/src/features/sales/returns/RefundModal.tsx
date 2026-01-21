import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface RefundModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
}

export const RefundModal = ({ isOpen, onClose, data }: RefundModalProps) => {
    if (!isOpen || !data) return null;

    const handleConfirm = () => {
        toast.success(`İade onaylandı: ${data.amount} ₺ iade edilecek.`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-md p-0 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
                    <h2 className="text-lg font-bold text-slate-900">İade Onayı</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                        <div className="shrink-0">
                            <CheckCircle2 className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <h4 className="font-medium text-amber-900 text-sm">Onay Bekleniyor</h4>
                            <p className="text-amber-700 text-xs mt-1">
                                Bu işlem sonucunda müşteriye <b>{data.amount} ₺</b> tutarında para iadesi yapılacaktır. Stoklar otomatik olarak güncellenecektir.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500">İade No</span>
                            <span className="font-mono">{data.id}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500">Müşteri</span>
                            <span className="font-medium">{data.customer}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500">Sebep</span>
                            <span>{data.reason}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-slate-900 font-bold">İade Tutarı</span>
                            <span className="text-indigo-600 font-bold text-lg">{data.amount} ₺</span>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" className="flex-1" onClick={onClose}>
                            Vazgeç
                        </Button>
                        <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleConfirm}>
                            Onayla ve İade Et
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};
