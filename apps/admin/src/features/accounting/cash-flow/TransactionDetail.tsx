import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Calendar, Tag, CreditCard, Wallet, User, AlignLeft, Loader2 } from 'lucide-react';
import { transactionsService, Transaction } from '../services/transactions.service';
import { toast } from 'sonner';

export const TransactionDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransaction = async () => {
            if (!id) return;
            try {
                const data = await transactionsService.getById(id);
                setTransaction(data);
            } catch (err) {
                console.error('İşlem detayı getirilirken hata:', err);
                toast.error('İşlem detayı yüklenirken bir hata oluştu');
            } finally {
                setLoading(false);
            }
        };

        fetchTransaction();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
            </div>
        );
    }

    if (!transaction) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-zinc-900">İşlem Bulunamadı</h3>
                <p className="text-sm text-zinc-500 mt-1">Aradığınız kasa hareketi silinmiş veya taşınmış olabilir.</p>
                <Button onClick={() => navigate(-1)} className="mt-4" variant="secondary">
                    Geri Dön
                </Button>
            </div>
        );
    }

    const isIncome = transaction.type === 'INCOME';
    const isCash = transaction.paymentMethod === 'CASH';

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate(-1)} className="text-zinc-500">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Geri Dön
                </Button>
                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">İşlem Detayı</h1>
            </div>

            <Card className="p-8 border border-zinc-200/80 shadow-sm relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${isIncome ? 'bg-emerald-500' : 'bg-red-500'}`} />
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-zinc-100">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {isIncome ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownLeft className="w-3 h-3 mr-1" />}
                                {isIncome ? 'Gelir' : 'Gider'}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700">
                                {isCash ? <Wallet className="w-3 h-3 mr-1" /> : <CreditCard className="w-3 h-3 mr-1" />}
                                {isCash ? 'Nakit Kasa' : 'Banka Hesabı'}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-zinc-900">{transaction.category || 'Kategorisiz İşlem'}</h2>
                        <p className="text-sm text-zinc-500 mt-1 flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {formatDate(transaction.transactionDate)}
                        </p>
                    </div>

                    <div className="text-left md:text-right">
                        <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-1">İşlem Tutarı</p>
                        <span className={`text-4xl font-black tracking-tight ${isIncome ? 'text-emerald-600' : 'text-zinc-900'}`}>
                            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2 mb-2">
                                <AlignLeft className="w-4 h-4 text-zinc-400" />
                                Açıklama
                            </h4>
                            <p className="text-[15px] text-zinc-700 leading-relaxed bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                                {transaction.description || 'Bu işlem için açıklama girilmemiş.'}
                            </p>
                        </div>

                        {transaction.reference && (
                            <div>
                                <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2 mb-2">
                                    <Tag className="w-4 h-4 text-zinc-400" />
                                    Referans No / Belge No
                                </h4>
                                <p className="text-[15px] font-mono text-zinc-700">
                                    {transaction.reference}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2 mb-2">
                                <User className="w-4 h-4 text-zinc-400" />
                                İşlemi Yapan
                            </h4>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold">
                                    {transaction.user ? transaction.user.firstName[0] : 'S'}
                                </div>
                                <div>
                                    <p className="text-[15px] font-semibold text-zinc-900">
                                        {transaction.user ? `${transaction.user.firstName} ${transaction.user.lastName}` : 'Sistem'}
                                    </p>
                                    <p className="text-[13px] text-zinc-500">
                                        Kayıt: {formatDate(transaction.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                            <h4 className="text-sm font-bold text-blue-900 mb-1">Muhasebe Notu</h4>
                            <p className="text-[13px] text-blue-800 leading-relaxed">
                                Bu kayıt otomatik olarak <strong>{isCash ? 'Nakit Kasa' : 'Banka/Kredi Kartı'}</strong> bilançosuna {isIncome ? 'eklenmiştir' : 'yansıtılmıştır'}. Herhangi bir hatalı işlem durumunda yönetici ile iletişime geçin.
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};
