export interface Banner {
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

export interface PageHeader {
  id: string;
  pageSlug: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  iconName?: string;
  isActive: boolean;
  updatedAt: string;
}

export type PageSlug = 'cok-satanlar' | 'giyim' | 'indirim' | 'aksesuar';
