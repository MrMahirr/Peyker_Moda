import { useRoutes, Navigate, useLocation } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { LoginPage } from '@/features/auth/LoginPage';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StaffPage } from '@/features/staff/StaffPage';
import { CatalogPage } from '@/features/catalog/CatalogPage';
import { AddProductPage } from '@/features/catalog/AddProductPage';
import { ProductDetailPage } from '@/features/catalog/ProductDetailPage';
import { CategoryList } from '@/features/catalog/components/CategoryList';
import { PosLayout } from '@/components/layout/PosLayout';
import { PosPage } from '@/features/pos/PosPage';
import { CRMPage } from '@/features/crm/CRMPage';
import { CustomerDetail } from '@/features/crm/components/CustomerDetail';
import { ReturnRequests } from '@/features/sales/returns/ReturnRequests';
import { OrderList } from '@/features/sales/orders/OrderList';
import { OrderDetail } from '@/features/sales/orders/OrderDetail';
import { AccountingPage } from '@/features/accounting/AccountingPage';
import { StoreSettings } from '@/features/settings/general/StoreSettings';
import { ReceiptDesigner } from '@/features/settings/printer/ReceiptDesigner';
import { UserProfile } from '@/features/settings/profile/UserProfile';
import { CampaignList } from '@/features/marketing/campaigns/CampaignList';
import { CampaignForm } from '@/features/marketing/campaigns/CampaignForm';
import { PriceListManager } from '@/features/marketing/price-lists/PriceListManager';
import { BulkMessageSender } from '@/features/marketing/messaging/BulkMessageSender';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { InventoryPage } from '@/features/catalog/InventoryPage';
import { ShippingPage } from '@/features/shipping/ShippingPage';
import { ReportsPage } from '@/features/reports/ReportsPage';
import { SuppliersPage } from '@/features/suppliers/SuppliersPage';
import { CmsPage } from '@/features/cms/CmsPage';
import { useAuth } from '@/context/AuthContext';

const RequireAuth = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-sm font-semibold text-zinc-500">
                Yukleniyor...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    return children;
};

export const AppRoutes = () => {
    return useRoutes([
        {
            path: '/auth',
            element: <AuthLayout />,
            children: [
                { path: 'login', element: <LoginPage /> },
            ],
        },
        {
            path: '/',
            element: (
                <RequireAuth>
                    <AdminLayout />
                </RequireAuth>
            ),
            children: [
                { index: true, element: <DashboardPage /> },
                { path: 'staff', element: <StaffPage /> },
                { path: 'inventory', element: <InventoryPage /> },
                { path: 'catalog', element: <CatalogPage /> },
                { path: 'catalog/new', element: <AddProductPage /> },
                { path: 'catalog/:id', element: <ProductDetailPage /> },
                { path: 'catalog/categories', element: <CategoryList /> },
                {
                    path: 'sales',
                    children: [
                        { path: 'orders', element: <OrderList /> },
                        { path: 'orders/:id', element: <OrderDetail /> },
                    ]
                },
                {
                    path: 'crm',
                    children: [
                        { index: true, element: <CRMPage /> },
                        { path: ':id', element: <CustomerDetail /> }
                    ]
                },
                { path: 'returns', element: <ReturnRequests /> },
                { path: 'accounting', element: <AccountingPage /> },
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
            element: (
                <RequireAuth>
                    <PosLayout />
                </RequireAuth>
            ),
            children: [
                { index: true, element: <PosPage /> }
            ]
        }
    ]);
};
