import { useState } from 'react';
import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/Button';
import { BadgeCheck, XCircle, FileText, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import { showDeleteConfirm } from '@/utils/swal';
import { RefundModal } from './RefundModal';

const MOCK_RETURNS = [
    { id: 'RET-1001', orderId: 'TR-45920', customer: 'Ayşe Yılmaz', date: '2024-01-22', amount: 450.00, status: 'Bekliyor', reason: 'Beden Uymadı' },
    { id: 'RET-1002', orderId: 'TR-45921', customer: 'Mehmet Demir', date: '2024-01-21', amount: 1250.00, status: 'Onaylandı', reason: 'Kusurlu Ürün' },
    { id: 'RET-1003', orderId: 'TR-45922', customer: 'Zeynep Kaya', date: '2024-01-20', amount: 320.00, status: 'Reddedildi', reason: 'Kullanıcı Hatası' },
];

export const ReturnRequests = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState<any>(null);

    const handleApprove = (ret: any) => {
        setSelectedReturn(ret);
        setIsRefundModalOpen(true);
    };

    const handleReject = (ret: any) => {
        showDeleteConfirm('İadeyi Reddet?', `${ret.id} numaralı iade talebi reddedilecek.`).then((result) => {
            if (result.isConfirmed) {
                toast.info('İade talebi reddedildi.');
            }
        });
    };

    const columns = [
        {
            header: 'İade No',
            accessorKey: 'id',
            cell: (info: any) => <span className="font-mono font-medium text-indigo-600">{info.getValue()}</span>
        },
        {
            header: 'Sipariş No',
            accessorKey: 'orderId',
            cell: (info: any) => <span className="font-mono text-slate-500">{info.getValue()}</span>
        },
        {
            header: 'Müşteri',
            accessorKey: 'customer',
        },
        {
            header: 'Sebep',
            accessorKey: 'reason',
        },
        {
            header: 'Tutar',
            accessorKey: 'amount',
            cell: (info: any) => <span className="font-bold text-slate-900">{info.getValue()} ₺</span>
        },
        {
            header: 'Durum',
            accessorKey: 'status',
            cell: (info: any) => {
                const status = info.getValue() as string;
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status === 'Onaylandı' ? 'bg-green-100 text-green-800' :
                        status === 'Reddedildi' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                        }`}>
                        {status}
                    </span>
                );
            }
        },
        {
            header: 'İşlemler',
            id: 'actions',
            cell: (info: any) => (
                <div className="flex items-center gap-1">
                    {info.row.original.status === 'Bekliyor' && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-green-600"
                                onClick={() => handleApprove(info.row.original)}
                                title="Onayla"
                            >
                                <BadgeCheck className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-red-600"
                                onClick={() => handleReject(info.row.original)}
                                title="Reddet"
                            >
                                <XCircle className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-indigo-600"
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
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">İade Talepleri</h1>
                    <p className="text-slate-500">Müşteri iade ve değişim süreçlerini yönetin.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" />
                        Filtrele
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                        Manuel İade Oluştur
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-200">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="İade No, Sipariş No veya Müşteri Ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-slate-50"
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
