export interface BannerRecord {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
