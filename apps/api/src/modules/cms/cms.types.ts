export interface BlogPostRecord {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image?: string;
  isPublished: boolean;
  authorId: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostResponse extends BlogPostRecord {
  authorName?: string;
}

export interface CmsPageRecord {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  isSystem: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FaqItemRecord {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
