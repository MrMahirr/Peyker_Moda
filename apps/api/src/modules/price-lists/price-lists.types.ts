export enum PriceListScopeType {
  ALL_PRODUCTS = 'ALL_PRODUCTS',
  CATEGORY = 'CATEGORY',
  PRODUCT = 'PRODUCT',
}

export enum PriceListAdjustmentType {
  FIXED_PRICE = 'FIXED_PRICE',
  PERCENTAGE_DISCOUNT = 'PERCENTAGE_DISCOUNT',
  FIXED_DISCOUNT = 'FIXED_DISCOUNT',
}

export enum PriceListEffectiveStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SCHEDULED = 'SCHEDULED',
  EXPIRED = 'EXPIRED',
}

export interface PriceListRecord {
  id: string;
  name: string;
  description?: string;
  customerGroupId?: string;
  scopeType: PriceListScopeType;
  categoryId?: string;
  productId?: string;
  adjustmentType: PriceListAdjustmentType;
  amount: number;
  currency: string;
  priority: number;
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PriceListResponse extends PriceListRecord {
  customerGroupName?: string;
  scopeLabel: string;
  targetId?: string;
  targetName?: string;
  adjustmentLabel: string;
  effectiveStatus: PriceListEffectiveStatus;
}

export interface PriceListMetadataItem {
  id: string;
  name: string;
}

export interface PriceListMetadataProduct extends PriceListMetadataItem {
  sku: string;
}

export interface PriceListMetadataResponse {
  customerGroups: PriceListMetadataItem[];
  categories: PriceListMetadataItem[];
  products: PriceListMetadataProduct[];
}

export interface ResolvedPriceListReferences {
  customerGroupId?: string;
  customerGroupName?: string;
  categoryId?: string;
  categoryName?: string;
  productId?: string;
  productName?: string;
}
