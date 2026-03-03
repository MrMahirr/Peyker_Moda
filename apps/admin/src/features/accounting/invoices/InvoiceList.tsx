import { useEffect, useState } from 'react';
import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, Download, Eye, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { invoicesService, Invoice, downloadInvoicePdf } from '../services/invoices.service';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
};

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR');
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    DRAFT: { label: 'Taslak', color: 'bg-slate-100 text-slate-700' },
    ISSUED: { label: 'Kesildi', color: 'bg-blue-100 text-blue-700' },
    PAID: { label: 'Ödendi', color: 'bg-green-100 text-green-800' },
    CANCELLED: { label: 'İptal', color: 'bg-red-100 text-red-700' },
};

export const InvoiceList = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [downloading, setDownloading] = useState<string | null>(null);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const data = await invoicesService.getAll({ limit: 50 });
            setInvoices(data || []);
        } catch (err) {
            console.error('Invoices fetch error:', err);
            toast.error('Faturalar yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (invoice: Invoice) => {
        setDownloading(invoice.id);
        try {
            await downloadInvoicePdf(invoice.id, invoice.invoiceNumber);
            toast.success('PDF indirildi');
        } catch (err) {
            toast.error('PDF indirilemedi');
        } finally {
            setDownloading(null);
        }
    };

    const handleMarkPaid = async (id: string) => {
        try {
            await invoicesService.markAsPaid(id);
            toast.success('Fatura ödendi olarak işaretlendi');
            fetchInvoices();
        } catch (err) {
            toast.error('İşlem başarısız');
        }
    };

    const columns = [
        {
            header: 'Fatura No',
            accessorKey: 'invoiceNumber',
            cell: (info: any) => <span className="font-mono font-medium text-indigo-600">{info.getValue()}</span>
        },
        {
            header: 'Tarih',
            accessorKey: 'createdAt',
            cell: (info: any) => formatDate(info.getValue())
        },
        {
            header: 'Alıcı / Firma',
            accessorKey: 'customer',
            cell: (info: any) => {
                const customer = info.row.original.customer;
                return customer ? (
                    <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{customer.firstName} {customer.lastName}</span>
                        <span className="text-xs text-slate-500">{customer.phone}</span>
                    </div>
                ) : <span className="text-slate-400">-</span>;
            }
        },
        {
            header: 'Tutar',
            accessorKey: 'total',
            cell: (info: any) => <span className="font-bold text-slate-900">{formatCurrency(info.getValue())}</span>
        },
        {
            header: 'Durum',
            accessorKey: 'status',
            cell: (info: any) => {
                const status = info.getValue() as string;
                const statusInfo = STATUS_MAP[status] || { label: status, color: 'bg-slate-100' };
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                    </span>
                );
            }
        },
        {
            header: 'İşlemler',
            id: 'actions',
            cell: (info: any) => {
                const invoice = info.row.original;
                return (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-indigo-600"
                            onClick={() => handleDownload(invoice)}
                            disabled={downloading === invoice.id}
                        >
                            {downloading === invoice.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                        </Button>
                        {invoice.status === 'ISSUED' && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-500 hover:text-green-600"
                                onClick={() => handleMarkPaid(invoice.id)}
                                title="Ödendi olarak işaretle"
                            >
                                <CheckCircle className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                );
            }
        }
    ];

    const filteredData = invoices.filter(i =>
        i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.customer && `${i.customer.firstName} ${i.customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg text-slate-800">Fatura Listesi</h3>
                <div className="flex gap-2">
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Yeni Fatura Kes
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Fatura No veya Alıcı Ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-white"
                    />
                </div>
            </div>

            <DataGrid
                data={filteredData}
                columns={columns}
            />
        </div>
    );
};
