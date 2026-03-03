import { useEffect, useState } from 'react';
import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, Download, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { invoicesService, Invoice, downloadInvoicePdf } from '../services/invoices.service';
import { Badge } from '@/components/ui/Badge';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
};

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR');
};

const STATUS_MAP: Record<string, { label: string; variant: 'neutral' | 'info' | 'success' | 'error' }> = {
    DRAFT: { label: 'Taslak', variant: 'neutral' },
    ISSUED: { label: 'Kesildi', variant: 'info' },
    PAID: { label: 'Ödendi', variant: 'success' },
    CANCELLED: { label: 'İptal', variant: 'error' },
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
            toast.error('Faturalar yüklenemedi', { className: 'font-medium' });
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (invoice: Invoice) => {
        setDownloading(invoice.id);
        try {
            await downloadInvoicePdf(invoice.id, invoice.invoiceNumber);
            toast.success('Fatura PDF olarak indirildi', { className: 'font-medium' });
        } catch (err) {
            toast.error('PDF indirilemedi', { className: 'font-medium' });
        } finally {
            setDownloading(null);
        }
    };

    const handleMarkPaid = async (id: string) => {
        try {
            await invoicesService.markAsPaid(id);
            toast.success('Fatura tahsil edildi', { className: 'font-medium py-3 px-4 shadow-xl' });
            fetchInvoices();
        } catch (err) {
            toast.error('İşlem başarısız', { className: 'font-medium' });
        }
    };

    const columns = [
        {
            header: 'Fatura No',
            accessorKey: 'invoiceNumber',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => <span className="font-mono text-[13px] font-bold text-zinc-900 bg-zinc-100/80 px-2 py-1 rounded-md border border-zinc-200/50">{info.getValue()}</span>
        },
        {
            header: 'Tarih',
            accessorKey: 'createdAt',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => <span className="text-zinc-500 text-[13px] font-medium">{formatDate(info.getValue())}</span>
        },
        {
            header: 'Müşteri / Cari',
            accessorKey: 'customer',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: ({ row }: any) => {
                const customer = row.original.customer;
                return customer ? (
                    <div className="flex flex-col">
                        <span className="font-semibold text-[14px] text-zinc-900">{customer.firstName} {customer.lastName}</span>
                        <span className="text-[11px] font-medium text-zinc-500">{customer.phone}</span>
                    </div>
                ) : <span className="text-zinc-400 font-medium">-</span>;
            }
        },
        {
            header: 'Tutar',
            accessorKey: 'total',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => <span className="font-bold text-[15px] font-mono text-zinc-900">{formatCurrency(info.getValue())}</span>
        },
        {
            header: 'Durum',
            accessorKey: 'status',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => {
                const status = info.getValue() as string;
                const statusInfo = STATUS_MAP[status] || { label: status, variant: 'neutral' };
                return (
                    <Badge variant={statusInfo.variant} dot>
                        {statusInfo.label}
                    </Badge>
                );
            }
        },
        {
            header: 'İşlemler',
            id: 'actions',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: ({ row }: any) => {
                const invoice = row.original;
                return (
                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50"
                            onClick={() => handleDownload(invoice)}
                            disabled={downloading === invoice.id}
                        >
                            {downloading === invoice.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                        </Button>
                        {invoice.status === 'ISSUED' && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50"
                                onClick={() => handleMarkPaid(invoice.id)}
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
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
                <p className="text-sm font-medium text-zinc-500">Faturalar yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="font-semibold text-[17px] text-zinc-900 tracking-tight">Fatura Listesi</h3>
                <div className="flex items-center gap-2">
                    <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
                        Yeni Fatura Kes
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-zinc-50 p-2 rounded-xl border border-zinc-200/80 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                        placeholder="Fatura No veya Müşteri Ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-zinc-900 placeholder:text-zinc-400 transition-all shadow-sm"
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
