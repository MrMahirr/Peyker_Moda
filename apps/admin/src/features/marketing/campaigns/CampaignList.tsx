import { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/Button';
import { Plus, Loader2, Trash, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { showDeleteConfirm } from '@/utils/swal';
import { campaignsService, Campaign } from '../services/campaigns.service';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { CampaignModal } from './CampaignForm';

export const CampaignList = () => {
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const data = await campaignsService.getAllCampaigns();
            setCampaigns(data || []);
        } catch (err) {
            console.error('Campaigns fetch error:', err);
            toast.error('Kampanyalar yüklenemedi', { className: 'font-medium' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        const result = await showDeleteConfirm('Kampanyayı Sil?', 'Bu işlem geri alınamaz!');
        if (result.isConfirmed) {
            try {
                await campaignsService.deleteCampaign(id);
                toast.success('Kampanya silindi', { className: 'font-medium' });
                fetchCampaigns();
            } catch (err) {
                console.error('Delete error:', err);
                toast.error('Kampanya silinemedi', { className: 'font-medium' });
            }
        }
    };

    const handleToggleStatus = async (campaign: Campaign) => {
        try {
            await campaignsService.updateCampaign(campaign.id, { isActive: !campaign.isActive });
            toast.success(campaign.isActive ? 'Kampanya durduruldu.' : 'Kampanya aktifleştirildi.', { className: 'font-medium py-3 px-4 shadow-xl' });
            fetchCampaigns();
        } catch (err) {
            console.error('Toggle error:', err);
            toast.error('Durum değiştirilemedi', { className: 'font-medium' });
        }
    };

    const formatDate = (date: string) => new Date(date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const columns: ColumnDef<Campaign>[] = [
        {
            accessorKey: 'name',
            header: 'Kampanya Detayı',
            cell: ({ row }) => (
                <div className="flex flex-col py-1">
                    <div className="font-bold text-[14px] text-zinc-900">{row.original.name}</div>
                    {row.original.code && (
                        <div className="mt-1">
                            <span className="text-[11px] font-mono font-bold tracking-widest bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded border border-zinc-200/80">
                                {row.original.code}
                            </span>
                        </div>
                    )}
                </div>
            )
        },
        {
            accessorKey: 'discountType',
            header: 'Tür',
            cell: ({ row }) => {
                const type = row.original.discountType;
                let variant: 'neutral' | 'info' | 'success' | 'warning' | 'error' = 'neutral';
                let label: string = type;
                
                if (type === 'PERCENTAGE') { label = 'Yüzdelik'; variant = 'info'; }
                if (type === 'FIXED_AMOUNT') { label = 'Sabit Tutar'; variant = 'warning'; }
                if (type === 'BUY_X_GET_Y') { label = 'Al-Kazan'; variant = 'success'; }
                
                return <Badge variant={variant}>{label}</Badge>;
            }
        },
        {
            accessorKey: 'discountValue',
            header: 'Değer',
            cell: ({ row }) => {
                const type = row.original.discountType;
                const value = row.original.discountValue;
                return (
                    <span className="font-black text-[15px] font-mono text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                        {type === 'PERCENTAGE' ? `%${value}` : `${value} ₺`}
                    </span>
                );
            }
        },
        {
            accessorKey: 'isActive',
            header: 'Durum',
            cell: ({ row }) => (
                <Badge variant={row.original.isActive ? 'success' : 'error'} dot className={row.original.isActive ? '' : 'opacity-70'}>
                    {row.original.isActive ? 'Aktif' : 'Pasif'}
                </Badge>
            )
        },
        {
            accessorKey: 'startDate',
            header: 'Tarih Aralığı',
            cell: ({ row }) => (
                <div className="flex flex-col text-[12px] font-medium text-zinc-500 gap-0.5">
                    <span>{formatDate(row.original.startDate)}</span>
                    <span className="text-zinc-400">to {formatDate(row.original.endDate)}</span>
                </div>
            )
        },
        {
            accessorKey: 'usageCount',
            header: 'Kullanım',
            cell: ({ row }) => (
                <span className="font-semibold text-[13px] text-zinc-700">
                    {row.original.usageCount} <span className="text-zinc-400 font-normal">/ {row.original.maxUsage || 'Sınırsız'}</span>
                </span>
            )
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 transition-transform hover:scale-110 active:scale-95 ${row.original.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                        onClick={() => handleToggleStatus(row.original)}
                        title={row.original.isActive ? "Durdur" : "Başlat"}
                    >
                        {row.original.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-zinc-400 transition-transform hover:scale-110 active:scale-95 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(row.original.id)}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
                <p className="text-[13px] font-medium text-zinc-500">Kampanyalar yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Pazarlama Kampanyaları"
                subtitle="İndirimleri, fırsatları ve kupon kodlarını yönetin."
                actions={
                    <Button onClick={() => setIsModalOpen(true)} variant="primary" className="shadow-md" icon={<Plus className="w-4 h-4" />}>
                        Yeni Kampanya
                    </Button>
                }
            />

            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden p-1">
                <DataGrid
                    columns={columns}
                    data={campaigns}
                    searchKey="name"
                />
            </div>
            
            <CampaignModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchCampaigns} 
            />
        </div>
    );
};
