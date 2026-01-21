import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, User, ShoppingBag, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SalesHistory } from './SalesHistory';

export const CustomerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Geri
                </Button>
                <h1 className="text-2xl font-bold text-slate-900">Müşteri Detayı</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="p-6 space-y-4">
                    <div className="flex flex-col items-center text-center">
                        <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                            <User className="h-10 w-10" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Mock Müşteri {id}</h2>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                            VIP
                        </span>
                    </div>
                </Card>

                {/* Stats */}
                <Card className="p-6 col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Özet İstatistikler</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                                <ShoppingBag className="h-4 w-4" />
                                Toplam Harcama
                            </div>
                            <p className="text-2xl font-bold text-indigo-600">15.450,00 ₺</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                                <Calendar className="h-4 w-4" />
                                Son Ziyaret
                            </div>
                            <p className="text-2xl font-bold text-slate-900">20 Ocak 2024</p>
                        </div>
                    </div>
                </Card>

                {/* Sales History Table */}
                <Card className="p-6 col-span-1 md:col-span-3">
                    <SalesHistory />
                </Card>
            </div>
        </div>
    );
};
