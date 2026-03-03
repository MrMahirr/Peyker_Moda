import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * DashboardLayout is now a simple pass-through wrapper.
 * The actual sidebar + header layout is handled by AdminLayout via the router.
 */
export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return <>{children}</>;
};
