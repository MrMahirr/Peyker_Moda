export enum CustomerChurnRisk {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface CustomerAnalyticsResponse {
  customerId: string;
  lifetimeValue: number;
  averageOrderValue: number;
  purchaseFrequency: number;
  lastPurchaseDate?: string;
  favoriteCategory?: string;
  churnRisk: CustomerChurnRisk;
}
