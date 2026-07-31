export interface Permission { id: string; name: string; description: string; module: string; }

export interface Role { id: string; name: string; description: string; permissions: string[]; isSystem: boolean; }

export interface StaffMember { id: string; firstName: string; lastName: string; email: string; phone?: string; roleId: string; roleName?: string; branchId?: string; isActive: boolean; joinedAt: string; lastLoginAt?: string; }

export interface StaffPerformance { staffId: string; staffName: string; totalSales: number; totalOrders: number; averageOrderValue: number; returnedOrders: number; }
