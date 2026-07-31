import { LoyaltyTier } from './loyalty.types';

export const LOYALTY_STORAGE_KEYS = {
  TIERS: 'loyalty.tiers',
  CUSTOMERS: 'loyalty.customers',
} as const;

export const DEFAULT_LOYALTY_TIERS: LoyaltyTier[] = [
  {
    id: 'tier-bronze',
    name: 'Bronze',
    minSpent: 0,
    discountPercent: 0,
    pointMultiplier: 1,
    color: '#A16207',
  },
  {
    id: 'tier-silver',
    name: 'Silver',
    minSpent: 5000,
    discountPercent: 5,
    pointMultiplier: 1.25,
    color: '#64748B',
  },
  {
    id: 'tier-gold',
    name: 'Gold',
    minSpent: 15000,
    discountPercent: 10,
    pointMultiplier: 1.5,
    color: '#D97706',
  },
];
