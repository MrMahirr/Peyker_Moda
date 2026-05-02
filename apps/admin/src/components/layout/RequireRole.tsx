import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface RequireRoleProps {
    children: JSX.Element;
    allowedRoles: string[];
}

export const RequireRole = ({ children, allowedRoles }: RequireRoleProps) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center text-sm font-semibold text-zinc-500">
                Yetki kontrol ediliyor...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    const userRole = user?.role?.toLowerCase() || '';

    // Eğer kullanıcının rolü istenen rollerden biri değilse, Dashboard'a geri yolla.
    if (!allowedRoles.includes(userRole)) {
        console.warn(`Access Denied: User role '${userRole}' is not in allowed roles [${allowedRoles.join(', ')}]`);
        return <Navigate to="/" replace />;
    }

    return children;
};
