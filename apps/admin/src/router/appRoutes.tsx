import { useRoutes } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { LoginPage } from '@/features/auth/LoginPage';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StaffPage } from '@/features/staff/StaffPage';
import { CatalogPage } from '@/features/catalog/CatalogPage';
import { AddProductPage } from '@/features/catalog/AddProductPage';
import { PosLayout } from '@/components/layout/PosLayout';
import { PosPage } from '@/features/pos/PosPage';
import { CRMPage } from '@/features/crm/CRMPage';
import { CustomerDetail } from '@/features/crm/components/CustomerDetail';
import { ReturnRequests } from '@/features/sales/returns/ReturnRequests';
import { AccountingPage } from '@/features/accounting/AccountingPage';
import { StoreSettings } from '@/features/settings/general/StoreSettings';
import { ReceiptDesigner } from '@/features/settings/printer/ReceiptDesigner';
import { UserProfile } from '@/features/settings/profile/UserProfile';
import { CampaignList } from '@/features/marketing/campaigns/CampaignList';
import { CampaignForm } from '@/features/marketing/campaigns/CampaignForm';
import { PriceListManager } from '@/features/marketing/price-lists/PriceListManager';
import { BulkMessageSender } from '@/features/marketing/messaging/BulkMessageSender';
import { DashboardPage } from '@/features/dashboard/DashboardPage';

export const AppRoutes = () => {
    return useRoutes([
        // ...

        {
            path: '/auth',
            element: <AuthLayout />,
            children: [
                {
                    path: 'login',
                    element: <LoginPage />,
                },
            ],
        },
        {
            path: '/',
            element: <AdminLayout />,
            children: [
                {
                    index: true,
                    element: <DashboardPage />,
                },
                {
                    path: 'staff',
                    element: <StaffPage />,
                },
                {
                    path: 'catalog',
                    element: <CatalogPage />,
                    children: [
                        { path: 'new', element: <AddProductPage /> }
                    ]
                },
                {
                    path: 'crm',
                    children: [
                        { index: true, element: <CRMPage /> },
                        { path: ':id', element: <CustomerDetail /> }
                    ]
                },
                {
                    path: 'returns',
                    element: <ReturnRequests />
                },
                {
                    path: 'accounting',
                    element: <AccountingPage />
                },
                {
                    path: 'marketing',
                    children: [
                        { path: 'campaigns', element: <CampaignList /> },
                        { path: 'campaigns/new', element: <CampaignForm /> },
                        { path: 'price-lists', element: <PriceListManager /> },
                        { path: 'bulk-messages', element: <BulkMessageSender /> },
                    ]
                },
                {
                    path: 'settings',
                    children: [
                        { path: 'general', element: <StoreSettings /> },
                        { path: 'printer', element: <ReceiptDesigner /> },
                        { path: 'profile', element: <UserProfile /> },
                    ]
                }
            ],
        },
        {
            path: '/pos',
            element: <PosLayout />,
            children: [
                { index: true, element: <PosPage /> }
            ]
        }
    ]);
};
