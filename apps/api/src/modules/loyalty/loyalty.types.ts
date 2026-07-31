export interface LoyaltyTier {
  id: string;
  name: string;
  minSpent: number;
  discountPercent: number;
  pointMultiplier: number;
  color: string;
}

export interface LoyaltyPoints {
  customerId: string;
  currentPoints: number;
  totalEarned: number;
  totalSpent: number;
  tier: LoyaltyTier;
}

export interface LoyaltyPointAdjustment {
  id: string;
  points: number;
  reason: string;
  createdAt: string;
  userId: string;
}

export interface LoyaltyCustomerRecord {
  customerId: string;
  currentPoints: number;
  totalEarned: number;
  adjustments: LoyaltyPointAdjustment[];
}
