export type StockMovementType = 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT' | 'RETURN';

export interface StockMovement {
    id: string;
    type: StockMovementType;
    variantId: string;
    variantName?: string;
    productName?: string;
    quantity: number;
    previousStock: number;
    newStock: number;
    reason?: string;
    reference?: string;
    sourceWarehouseId?: string;
    targetWarehouseId?: string;
    userId: string;
    user?: {
        id: string;
        firstName: string;
        lastName: string;
    };
    createdAt: string;
}

export interface StockCountItem {
    variantId: string;
    variantName?: string;
    productName?: string;
    sku?: string;
    barcode?: string;
    systemStock: number;
    countedStock: number;
    difference: number;
}

export interface StockCount {
    id: string;
    status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    warehouseId?: string;
    items: StockCountItem[];
    notes?: string;
    userId: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface StockAlert {
    id: string;
    variantId: string;
    variantName?: string;
    productName?: string;
    currentStock: number;
    minimumStock: number;
    status: 'WARNING' | 'CRITICAL' | 'OUT_OF_STOCK';
}

export interface Warehouse {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    isDefault: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Brand {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    isActive: boolean;
    productCount?: number;
    createdAt: string;
}

export interface Tag {
    id: string;
    name: string;
    slug: string;
    color?: string;
    productCount?: number;
}

export interface Season {
    id: string;
    name: string;
    year: number;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
    productCount?: number;
    createdAt: string;
}

export interface StockMovementQueryParams {
    page?: number;
    limit?: number;
    type?: StockMovementType;
    variantId?: string;
    warehouseId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
}
