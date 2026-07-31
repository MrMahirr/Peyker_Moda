export interface PageHeaderRecord {
  id: string;
  pageSlug: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  iconName?: string;
  isActive: boolean;
  updatedAt: string;
}
