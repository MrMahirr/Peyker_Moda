export interface LoyaltyTier { id: string; name: string; minSpent: number; discountPercent: number; pointMultiplier: number; color: string; }
export interface LoyaltyPoints { customerId: string; currentPoints: number; totalEarned: number; totalSpent: number; tier: LoyaltyTier; }
export interface CustomerNote { id: string; customerId: string; content: string; type: 'CALL' | 'VISIT' | 'EMAIL' | 'OTHER'; userId: string; userName?: string; createdAt: string; }
export interface CustomerAnalysis { customerId: string; lifetimeValue: number; averageOrderValue: number; purchaseFrequency: number; lastPurchaseDate?: string; favoriteCategory?: string; churnRisk: 'LOW' | 'MEDIUM' | 'HIGH'; }
