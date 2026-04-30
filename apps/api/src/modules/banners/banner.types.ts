export interface BannerRecord {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
