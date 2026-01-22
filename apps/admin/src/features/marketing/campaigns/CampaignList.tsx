import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Campaign } from '../types';
import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_DATA: Campaign[] = [
    {
        id: '1',
        name: 'Yaz Sonu İndirimi',
        type: 'DISCOUNT',
        status: 'ACTIVE',
        startDate: '2023-09-01',
        endDate: '2023-09-30',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        usedCount: 154,
        createdAt: '2023-08-25',
        updatedAt: '2023-08-25'
    },
    {
        id: '2',
        name: 'Hoşgeldin Kuponu',
        type: 'COUPON',
        code: 'WELCOME10',
        status: 'ACTIVE',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        discountType: 'FIXED_AMOUNT',
        discountValue: 100,
        minOrderAmount: 1000,
        usedCount: 45,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01'
    }
];

export const CampaignList = () => {
    const navigate = useNavigate();

    const columns: ColumnDef<Campaign>[] = [
        {
            accessorKey: 'name',
            header: 'Kampanya Adı',
        },
        {
            accessorKey: 'type',
            header: 'Tür',
            cell: ({ row }) => {
                const type = row.getValue('type') as string;
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${type === 'DISCOUNT' ? 'bg-blue-100 text-blue-700' :
                            type === 'COUPON' ? 'bg-purple-100 text-purple-700' :
                                'bg-gray-100 text-gray-700'
                        }`}>
                        {type === 'DISCOUNT' ? 'İndirim' : type === 'COUPON' ? 'Kupon' : 'Toplu İndirim'}
                    </span>
                );
            }
        },
        {
            accessorKey: 'status',
            header: 'Durum',
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                            status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-700' :
                                status === 'ENDED' ? 'bg-gray-100 text-gray-500' :
                                    'bg-slate-100 text-slate-700'
                        }`}>
                        {status === 'ACTIVE' ? 'Aktif' :
                            status === 'SCHEDULED' ? 'Planlandı' :
                                status === 'ENDED' ? 'Bitti' : 'Taslak'}
                    </span>
                );
            }
        },
        {
            accessorKey: 'discountValue',
            header: 'Değer',
            cell: ({ row }) => {
                const type = row.original.discountType;
                const value = row.original.discountValue;
                return type === 'PERCENTAGE' ? `%${value}` : `₺${value}`;
            }
        },
        {
            accessorKey: 'startDate',
            header: 'Başlangıç',
        },
        {
            accessorKey: 'endDate',
            header: 'Bitiş',
        },
        {
            accessorKey: 'usedCount',
            header: 'Kullanım',
        }
    ];

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Kampanyalar</h1>
                    <p className="text-slate-500">İndirim ve kupon yönetimi</p>
                </div>
                <Button onClick={() => navigate('new')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Kampanya
                </Button>
            </div>

            <DataGrid
                columns={columns}
                data={MOCK_DATA}
                searchKey="name"
            />
        </div>
    );
};
