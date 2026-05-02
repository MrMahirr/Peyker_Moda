import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, User, ShoppingBag, Calendar, Phone, Mail, MapPin, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { customersService, Customer } from '../api/customerService';
import { SalesHistory } from './SalesHistory';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
};

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
};

export const CustomerDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomer = async () => {
            if (!id) return;
            try {
                const data = await customersService.getById(id);
                setCustomer(data);
            } catch (err) {
                console.error('Customer fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomer();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!customer) {
        return <div className="text-center py-12 text-red-600">Müşteri bulunamadı</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Geri
                </Button>
                <h1 className="text-2xl font-bold text-zinc-900">Müşteri Detayı</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="p-6 space-y-4">
                    <div className="flex flex-col items-center text-center">
                        <div className="h-20 w-20 bg-zinc-100 rounded-full flex items-center justify-center mb-4 text-zinc-400">
                            <User className="h-10 w-10" />
                        </div>
                        <h2 className="text-xl font-bold text-zinc-900">
                            {customer.firstName} {customer.lastName}
                        </h2>
                        {customer.group && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                                {customer.group.name}
                            </span>
                        )}
                    </div>
                    <div className="space-y-3 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-zinc-600">
                            <Phone className="h-4 w-4 text-zinc-400" />
                            {customer.phone}
                        </div>
                        {customer.email && (
                            <div className="flex items-center gap-2 text-sm text-zinc-600">
                                <Mail className="h-4 w-4 text-zinc-400" />
                                {customer.email}
                            </div>
                        )}
                        {customer.address && (
                            <div className="flex items-center gap-2 text-sm text-zinc-600">
                                <MapPin className="h-4 w-4 text-zinc-400" />
                                {customer.address}
                            </div>
                        )}
                    </div>
                </Card>

                {/* Stats */}
                <Card className="p-6 col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Özet İstatistikler</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-zinc-50 rounded-lg">
                            <div className="flex items-center gap-2 text-zinc-500 mb-1">
                                <ShoppingBag className="h-4 w-4" />
                                Toplam Harcama
                            </div>
                            <p className="text-2xl font-bold text-indigo-600">
                                {formatCurrency(customer.totalSpent || 0)}
                            </p>
                        </div>
                        <div className="p-4 bg-zinc-50 rounded-lg">
                            <div className="flex items-center gap-2 text-zinc-500 mb-1">
                                <ShoppingBag className="h-4 w-4" />
                                Sipariş Sayısı
                            </div>
                            <p className="text-2xl font-bold text-zinc-900">
                                {customer.orderCount || 0}
                            </p>
                        </div>
                        <div className="p-4 bg-zinc-50 rounded-lg">
                            <div className="flex items-center gap-2 text-zinc-500 mb-1">
                                <Calendar className="h-4 w-4" />
                                Kayıt Tarihi
                            </div>
                            <p className="text-lg font-bold text-zinc-900">
                                {formatDate(customer.createdAt)}
                            </p>
                        </div>
                    </div>
                    {customer.notes && (
                        <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                            <p className="text-sm text-amber-800"><strong>Not:</strong> {customer.notes}</p>
                        </div>
                    )}
                </Card>
            </div>

            <Card className="p-6">
                <SalesHistory customerId={customer.id} />
            </Card>
        </div>
    );
};
