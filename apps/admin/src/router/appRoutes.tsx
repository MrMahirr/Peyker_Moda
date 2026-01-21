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
                    element: <div className="p-8"><h1 className="text-2xl font-bold">Dashboard (Coming Soon)</h1></div>,
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
