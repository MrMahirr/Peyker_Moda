export interface BlogPost { id: string; title: string; slug: string; excerpt: string; content: string; image?: string; isPublished: boolean; authorId: string; createdAt: string; updatedAt: string; }
export interface CustomPage { id: string; title: string; slug: string; content: string; isPublished: boolean; isSystem?: boolean; createdAt: string; updatedAt: string; }
export interface FaqItem { id: string; question: string; answer: string; category: string; order: number; isActive: boolean; }
