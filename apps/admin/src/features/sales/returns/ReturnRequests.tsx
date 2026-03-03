import { useState } from 'react';
import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/Button';
import { BadgeCheck, XCircle, FileText, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import { showDeleteConfirm } from '@/utils/swal';
import { RefundModal } from './RefundModal';
import { Badge } from '@/components/ui/Badge';

const MOCK_RETURNS = [
    { id: 'RET-1001', orderId: 'TR-45920', customer: 'Ayşe Yılmaz', date: '2024-01-22', amount: 450.00, status: 'Bekliyor', reason: 'Beden Uymadı' },
    { id: 'RET-1002', orderId: 'TR-45921', customer: 'Mehmet Demir', date: '2024-01-21', amount: 1250.00, status: 'Onaylandı', reason: 'Kusurlu Ürün' },
    { id: 'RET-1003', orderId: 'TR-45922', customer: 'Zeynep Kaya', date: '2024-01-20', amount: 320.00, status: 'Reddedildi', reason: 'Kullanıcı Hatası' },
];

export const ReturnRequests = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedReturn, setSelectedReturn] = useState<any>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleApprove = (ret: any) => {
        setSelectedReturn(ret);
        setIsRefundModalOpen(true);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleReject = (ret: any) => {
        showDeleteConfirm('İadeyi Reddet?', `${ret.id} numaralı iade talebi reddedilecek.`).then((result) => {
            if (result.isConfirmed) {
                toast.info('İade talebi reddedildi.', { className: 'font-medium' });
            }
        });
    };

    const columns = [
        {
            header: 'İade No',
            accessorKey: 'id',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => <span className="font-mono text-[13px] font-bold text-zinc-900">{info.getValue()}</span>
        },
        {
            header: 'Sipariş No',
            accessorKey: 'orderId',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => <span className="font-mono text-[13px] text-zinc-500 font-medium">{info.getValue()}</span>
        },
        {
            header: 'Müşteri',
            accessorKey: 'customer',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => <span className="font-semibold text-zinc-900 text-[14px]">{info.getValue()}</span>
        },
        {
            header: 'Sebep',
            accessorKey: 'reason',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => <span className="text-[13px] font-medium text-zinc-700">{info.getValue()}</span>
        },
        {
            header: 'Tutar',
            accessorKey: 'amount',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => <span className="font-bold text-[15px] font-mono text-zinc-900">{info.getValue().toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
        },
        {
            header: 'Durum',
            accessorKey: 'status',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => {
                const status = info.getValue() as string;
                let variant: 'neutral' | 'info' | 'success' | 'warning' | 'error' = 'neutral';
                if (status === 'Onaylandı') variant = 'success';
                if (status === 'Reddedildi') variant = 'error';
                if (status === 'Bekliyor') variant = 'warning';
                
                return (
                    <Badge variant={variant} dot>
                        {status}
                    </Badge>
                );
            }
        },
        {
            header: 'İşlemler',
            id: 'actions',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (info: any) => (
                <div className="flex justify-end items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    {info.row.original.status === 'Bekliyor' && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50"
                                onClick={() => handleApprove(info.row.original)}
                                title="Onayla"
                            >
                                <BadgeCheck className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleReject(info.row.original)}
                                title="Reddet"
                            >
                                <XCircle className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50"
                        title="Detay"
                    >
                        <FileText className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    const filteredData = MOCK_RETURNS.filter(r =>
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.orderId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-zinc-900">İade Talepleri</h1>
                    <p className="text-[13px] font-medium text-zinc-500 mt-1">Müşteri iade ve değişim süreçlerini yönetin.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" className="shadow-sm border border-zinc-200/80 bg-white hover:bg-zinc-50">
                        <Filter className="mr-2 h-4 w-4" />
                        Filtrele
                    </Button>
                    <Button variant="primary" className="shadow-md">
                        Manuel İade Oluştur
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-zinc-50 p-2 rounded-xl border border-zinc-200/80 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                        placeholder="İade No, Sipariş No veya Müşteri Ara..."
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

            <RefundModal
                isOpen={isRefundModalOpen}
                onClose={() => setIsRefundModalOpen(false)}
                data={selectedReturn}
            />
        </div>
    );
};
