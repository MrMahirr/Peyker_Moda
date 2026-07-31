import { CustomerList } from './components/CustomerList';
import { PageHeader } from '@/components/shared/PageHeader';

export const CRMPage = () => {
    return (
        <div className="space-y-6">
            <PageHeader title="Müşteriler" subtitle="Tüm müşterileri yönetin." />
            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-6">
                <CustomerList />
            </div>
        </div>
    );
};
