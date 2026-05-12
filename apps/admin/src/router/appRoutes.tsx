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
import { RequireRole } from '@/components/layout/RequireRole';

const RequireAuth = ({ children }: { children: React.ReactElement }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-sm font-semibold text-zinc-500">
                Yükleniyor...
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
                { path: 'staff', element: <RequireRole allowedRoles={['admin']}><StaffPage /></RequireRole> },
                { path: 'inventory', element: <RequireRole allowedRoles={['admin', 'manager']}><InventoryPage /></RequireRole> },
                { path: 'catalog', element: <RequireRole allowedRoles={['admin', 'manager']}><CatalogPage /></RequireRole> },
                { path: 'catalog/new', element: <RequireRole allowedRoles={['admin', 'manager']}><AddProductPage /></RequireRole> },
                { path: 'catalog/:id', element: <RequireRole allowedRoles={['admin', 'manager']}><ProductDetailPage /></RequireRole> },
                { path: 'catalog/categories', element: <RequireRole allowedRoles={['admin', 'manager']}><CategoryList /></RequireRole> },
                {
                    path: 'sales',
                    children: [
                        { path: 'orders', element: <RequireRole allowedRoles={['admin', 'manager', 'staff']}><OrderList /></RequireRole> },
                        { path: 'orders/:id', element: <RequireRole allowedRoles={['admin', 'manager', 'staff']}><OrderDetail /></RequireRole> },
                    ]
                },
                {
                    path: 'crm',
                    children: [
                        { index: true, element: <RequireRole allowedRoles={['admin', 'manager', 'staff']}><CRMPage /></RequireRole> },
                        { path: ':id', element: <RequireRole allowedRoles={['admin', 'manager', 'staff']}><CustomerDetail /></RequireRole> }
                    ]
                },
                { path: 'returns', element: <RequireRole allowedRoles={['admin', 'manager', 'staff']}><ReturnRequests /></RequireRole> },
                { path: 'accounting', element: <RequireRole allowedRoles={['admin', 'manager']}><AccountingPage /></RequireRole> },
                {
                    path: 'marketing',
                    children: [
                        { path: 'campaigns', element: <RequireRole allowedRoles={['admin', 'manager']}><CampaignList /></RequireRole> },
                        { path: 'campaigns/new', element: <RequireRole allowedRoles={['admin', 'manager']}><CampaignForm /></RequireRole> },
                        { path: 'price-lists', element: <RequireRole allowedRoles={['admin', 'manager']}><PriceListManager /></RequireRole> },
                        { path: 'bulk-messages', element: <RequireRole allowedRoles={['admin', 'manager']}><BulkMessageSender /></RequireRole> },
                    ]
                },
                {
                    path: 'settings',
                    children: [
                        { path: 'general', element: <RequireRole allowedRoles={['admin']}><StoreSettings /></RequireRole> },
                        { path: 'printer', element: <RequireRole allowedRoles={['admin']}><ReceiptDesigner /></RequireRole> },
                        { path: 'profile', element: <UserProfile /> }, // Everyone can see their profile
                    ]
                },
                // Additional routes mentioned in navigation
                { path: 'shipping', element: <RequireRole allowedRoles={['admin', 'manager']}><ShippingPage /></RequireRole> },
                { path: 'suppliers', element: <RequireRole allowedRoles={['admin', 'manager']}><SuppliersPage /></RequireRole> },
                { path: 'reports', element: <RequireRole allowedRoles={['admin', 'manager']}><ReportsPage /></RequireRole> },
                { path: 'cms', element: <RequireRole allowedRoles={['admin', 'manager']}><CmsPage /></RequireRole> }
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
