import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Search, User } from 'lucide-react';

export interface CustomerInfo {
    id: string;
    name: string;
    phone: string;
    group?: string;
    points?: number;
}

interface CustomerSelectProps {
    customers?: CustomerInfo[];
    onSelect?: (customer: CustomerInfo) => void;
}

const DEFAULT_CUSTOMERS: CustomerInfo[] = [
    { id: 'c-1', name: 'Ayse Demir', phone: '+90 532 111 2233', group: 'VIP', points: 420 },
    { id: 'c-2', name: 'Kaan Yilmaz', phone: '+90 533 444 5566', group: 'Standart', points: 80 },
    { id: 'c-3', name: 'Ece Kaya', phone: '+90 534 777 8899', group: 'Toptan', points: 1200 },
];

export const CustomerSelect = ({ customers = DEFAULT_CUSTOMERS, onSelect }: CustomerSelectProps) => {
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState<string | null>(null);

    const filtered = useMemo(() => {
        return customers.filter((c) =>
            c.name.toLowerCase().includes(query.toLowerCase()) || c.phone.includes(query)
        );
    }, [customers, query]);

    const selectedCustomer = customers.find((c) => c.id === selected);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-zinc-100 rounded-lg">
                    <User className="h-4 w-4 text-zinc-600" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-zinc-900">Musteri Secimi</h3>
                    <p className="text-[12px] text-zinc-500">Telefon veya isimle arama yapin.</p>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                    placeholder="Musteri ara..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-10 pl-9"
                />
            </div>

            <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm divide-y divide-zinc-100">
                {filtered.map((customer) => (
                    <button
                        key={customer.id}
                        onClick={() => setSelected(customer.id)}
                        className={`w-full text-left px-4 py-3 hover:bg-zinc-50 transition-colors ${
                            selected === customer.id ? 'bg-zinc-50' : ''
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-semibold text-[13px] text-zinc-900">{customer.name}</div>
                                <div className="text-[11px] text-zinc-500">{customer.phone}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                {customer.group && <Badge variant="info">{customer.group}</Badge>}
                                {typeof customer.points === 'number' && (
                                    <Badge variant="neutral">{customer.points} puan</Badge>
                                )}
                            </div>
                        </div>
                    </button>
                ))}
                {filtered.length === 0 && (
                    <div className="px-4 py-6 text-center text-[13px] text-zinc-500">Sonuc bulunamadi.</div>
                )}
            </div>

            <div className="flex justify-end">
                <Button
                    className="font-semibold"
                    disabled={!selectedCustomer}
                    onClick={() => selectedCustomer && onSelect?.(selectedCustomer)}
                >
                    Musteriyi Sec
                </Button>
            </div>
        </div>
    );
};
