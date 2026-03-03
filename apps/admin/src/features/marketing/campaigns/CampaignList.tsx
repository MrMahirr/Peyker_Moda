import { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/Button';
import { Plus, Loader2, Trash, ToggleLeft, ToggleRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { showDeleteConfirm } from '@/utils/swal';
import { campaignsService, Campaign } from '../services/campaigns.service';

export const CampaignList = () => {
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const data = await campaignsService.getAllCampaigns();
            setCampaigns(data || []);
        } catch (err) {
            console.error('Campaigns fetch error:', err);
            toast.error('Kampanyalar yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        const result = await showDeleteConfirm('Kampanyayı Sil?', 'Bu işlem geri alınamaz!');
        if (result.isConfirmed) {
            try {
                await campaignsService.deleteCampaign(id);
                toast.success('Kampanya silindi');
                fetchCampaigns();
            } catch (err) {
                console.error('Delete error:', err);
                toast.error('Kampanya silinemedi');
            }
        }
    };

    const handleToggleStatus = async (campaign: Campaign) => {
        try {
            await campaignsService.updateCampaign(campaign.id, { isActive: !campaign.isActive });
            toast.success(campaign.isActive ? 'Kampanya deactivate edildi' : 'Kampanya aktifleştirildi');
            fetchCampaigns();
        } catch (err) {
            console.error('Toggle error:', err);
            toast.error('Durum değiştirilemedi');
        }
    };

    const formatDate = (date: string) => new Date(date).toLocaleDateString('tr-TR');

    const columns: ColumnDef<Campaign>[] = [
        {
            accessorKey: 'name',
            header: 'Kampanya Adı',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium text-slate-900">{row.original.name}</div>
                    {row.original.code && (
                        <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded">{row.original.code}</span>
                    )}
                </div>
            )
        },
        {
            accessorKey: 'type',
            header: 'Tür',
            cell: ({ row }) => {
                const type = row.original.type;
                const typeMap: Record<string, { label: string; color: string }> = {
                    PERCENTAGE: { label: 'Yüzde', color: 'bg-blue-100 text-blue-700' },
                    FIXED_AMOUNT: { label: 'Sabit', color: 'bg-purple-100 text-purple-700' },
                    BUY_X_GET_Y: { label: 'Al-Kazan', color: 'bg-amber-100 text-amber-700' },
                };
                const info = typeMap[type] || { label: type, color: 'bg-slate-100' };
                return <span className={`px-2 py-1 rounded-full text-xs font-medium ${info.color}`}>{info.label}</span>;
            }
        },
        {
            accessorKey: 'discountValue',
            header: 'Değer',
            cell: ({ row }) => {
                const type = row.original.type;
                const value = row.original.discountValue;
                return <span className="font-semibold text-indigo-600">{type === 'PERCENTAGE' ? `%${value}` : `₺${value}`}</span>;
            }
        },
        {
            accessorKey: 'isActive',
            header: 'Durum',
            cell: ({ row }) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.original.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {row.original.isActive ? 'Aktif' : 'Pasif'}
                </span>
            )
        },
        {
            accessorKey: 'startDate',
            header: 'Tarih Aralığı',
            cell: ({ row }) => (
                <span className="text-sm text-slate-600">{formatDate(row.original.startDate)} - {formatDate(row.original.endDate)}</span>
            )
        },
        {
            accessorKey: 'usageCount',
            header: 'Kullanım',
            cell: ({ row }) => <span>{row.original.usageCount} / {row.original.maxUsage || '∞'}</span>
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleToggleStatus(row.original)}
                    >
                        {row.original.isActive ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-slate-400" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600"
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
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Kampanyalar</h1>
                    <p className="text-slate-500">İndirim ve kupon yönetimi</p>
                </div>
                <Button onClick={() => navigate('new')} className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Kampanya
                </Button>
            </div>

            <DataGrid
                columns={columns}
                data={campaigns}
                searchKey="name"
            />
        </div>
    );
};
