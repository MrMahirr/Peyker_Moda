import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  BLOG_POSTS_SETTING_KEY,
  CMS_FAQS_SETTING_KEY,
  CMS_PAGES_SETTING_KEY,
} from './cms.constants';
import {
  BlogPostRecord,
  CmsPageRecord,
  FaqItemRecord,
} from './cms.types';

@Injectable()
export class CmsStorageService {
  constructor(private readonly prisma: PrismaService) {}

  getBlogPosts() {
    return this.readJsonArray<BlogPostRecord>(BLOG_POSTS_SETTING_KEY);
  }

  saveBlogPosts(posts: BlogPostRecord[]) {
    return this.writeJsonArray(BLOG_POSTS_SETTING_KEY, posts);
  }

  getPages() {
    return this.readJsonArray<CmsPageRecord>(CMS_PAGES_SETTING_KEY);
  }

  savePages(pages: CmsPageRecord[]) {
    return this.writeJsonArray(CMS_PAGES_SETTING_KEY, pages);
  }

  getFaqs() {
    return this.readJsonArray<FaqItemRecord>(CMS_FAQS_SETTING_KEY);
  }

  saveFaqs(faqs: FaqItemRecord[]) {
    return this.writeJsonArray(CMS_FAQS_SETTING_KEY, faqs);
  }

  private async readJsonArray<T>(key: string): Promise<T[]> {
    const row = await this.prisma.setting.findUnique({
      where: { key },
      select: { value: true },
    });

    if (!row) {
      return [];
    }

    try {
      const parsed = JSON.parse(row.value) as T[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private async writeJsonArray<T>(key: string, value: T[]) {
    await this.prisma.setting.upsert({
      where: { key },
      create: {
        key,
        value: JSON.stringify(value),
      },
      update: {
        value: JSON.stringify(value),
      },
    });
  }
}
