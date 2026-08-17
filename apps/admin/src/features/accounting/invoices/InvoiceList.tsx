import { useEffect, useState, useCallback } from 'react';
import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, Download, Loader2, CheckCircle, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { invoicesService, Invoice, downloadInvoicePdf } from '../services/invoices.service';
import { Badge } from '@/components/ui/Badge';
import { InvoiceModal } from './InvoiceModal';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

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
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchInvoices = useCallback(async () => {
        try {
            const data = await invoicesService.getAll({ limit: 50 });
            setInvoices(data || []);
        } catch (err) {
            console.error('Invoices fetch error:', err);
            toast.error('Faturalar yüklenemedi', { className: 'font-medium' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

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

    const handleDelete = (id: string) => {
        MySwal.fire({
            title: 'Faturayı Sil',
            text: 'Bu işlemi (faturayı) silmek/iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#71717a',
            confirmButtonText: 'Evet, Sil',
            cancelButtonText: 'Vazgeç'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await invoicesService.cancel(id);
                    toast.success('Fatura silindi/iptal edildi', { className: 'font-medium py-3 px-4 shadow-xl' });
                    fetchInvoices();
                } catch (err) {
                    toast.error('Silme işlemi başarısız', { className: 'font-medium' });
                }
            }
        });
    };

    const columns = [
        {
            header: 'Fatura No',
            accessorKey: 'invoiceNumber',
             
            cell: (info: any) => <span className="font-mono text-[13px] font-bold text-zinc-900 bg-zinc-100/80 px-2 py-1 rounded-md border border-zinc-200/50">{info.getValue()}</span>
        },
        {
            header: 'Tarih',
            accessorKey: 'createdAt',
             
            cell: (info: any) => <span className="text-zinc-500 text-[13px] font-medium">{formatDate(info.getValue())}</span>
        },
        {
            header: 'Müşteri / Cari',
            accessorKey: 'customer',
             
            cell: ({ row }: any) => {
                const customer = row.original.customer;
                const customerName = row.original.customerName;
                return (customer || customerName) ? (
                    <div className="flex flex-col">
                        <span className="font-semibold text-[14px] text-zinc-900">{customer ? `${customer.firstName} ${customer.lastName}` : customerName}</span>
                        {customer && <span className="text-[11px] font-medium text-zinc-500">{customer.phone}</span>}
                    </div>
                ) : <span className="text-zinc-400 font-medium">-</span>;
            }
        },
        {
            header: 'Tutar',
            accessorKey: 'total',
             
            cell: (info: any) => <span className="font-bold text-[15px] font-mono text-zinc-900">{formatCurrency(info.getValue())}</span>
        },
        {
            header: 'Durum',
            accessorKey: 'status',
             
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
             
            cell: ({ row }: any) => {
                const invoice = row.original;
                return (
                    <div className="flex justify-end gap-2 opacity-60 hover:opacity-100 transition-opacity duration-300">
                        {/* Eye icon for Details */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 hover:scale-110 transition-all duration-300 hover:rotate-3 shadow-sm hover:shadow"
                            onClick={() => handleDownload(invoice)}
                            title="Detay Görüntüle"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        
                        {/* Download icon */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 hover:scale-110 transition-all duration-300 hover:-translate-y-0.5 shadow-sm hover:shadow"
                            onClick={() => handleDownload(invoice)}
                            disabled={downloading === invoice.id}
                            title="PDF İndir"
                        >
                            {downloading === invoice.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                        </Button>

                        {/* CheckCircle icon for Mark as Paid */}
                        {invoice.status === 'ISSUED' && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 hover:scale-110 transition-all duration-300 hover:-translate-y-0.5 shadow-sm hover:shadow"
                                onClick={() => handleMarkPaid(invoice.id)}
                                title="Tahsil Edildi İşaretle"
                            >
                                <CheckCircle className="h-4 w-4" />
                            </Button>
                        )}

                        {/* Trash icon for Delete/Cancel */}
                        {invoice.status !== 'CANCELLED' && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50 hover:scale-110 transition-all duration-300 hover:-rotate-3 shadow-sm hover:shadow"
                                onClick={() => handleDelete(invoice.id)}
                                title="Faturayı Sil"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                );
            }
        }
    ];

    const filteredData = invoices.filter(i =>
        i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.customer && `${i.customer.firstName} ${i.customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (i.customerName && i.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading && invoices.length === 0) {
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
                    <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
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

            <InvoiceModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchInvoices}
            />
        </div>
    );
};

