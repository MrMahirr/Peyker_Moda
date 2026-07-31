import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PageHeaderStorageService } from './page-header.storage.service';
import { PageHeaderRecord } from './page-header.types';

@Injectable()
export class PageHeadersService {
  constructor(private readonly storage: PageHeaderStorageService) {}

  async findAll() {
    return this.storage.getPageHeaders();
  }

  async findBySlug(pageSlug: string) {
    const headers = await this.storage.getPageHeaders();
    return headers.find(h => h.pageSlug === pageSlug && h.isActive) || null;
  }

  async upsert(pageSlug: string, data: Partial<PageHeaderRecord>) {
    const headers = await this.storage.getPageHeaders();
    const index = headers.findIndex((h) => h.pageSlug === pageSlug);

    const now = new Date().toISOString();

    if (index === -1) {
      const newHeader: PageHeaderRecord = {
        id: randomUUID(),
        pageSlug,
        title: data.title || '',
        subtitle: data.subtitle,
        imageUrl: data.imageUrl,
        iconName: data.iconName,
        isActive: data.isActive ?? true,
        updatedAt: now,
      };
      headers.push(newHeader);
      await this.storage.savePageHeaders(headers);
      return newHeader;
    }

    headers[index] = {
      ...headers[index],
      ...data,
      pageSlug, // slug cannot be changed
      updatedAt: now,
    };

    await this.storage.savePageHeaders(headers);
    return headers[index];
  }

  async remove(pageSlug: string) {
    const headers = await this.storage.getPageHeaders();
    const filtered = headers.filter((h) => h.pageSlug !== pageSlug);

    if (filtered.length === headers.length) {
      throw new NotFoundException('Page header bulunamadı');
    }

    await this.storage.savePageHeaders(filtered);
    return { message: 'Page header silindi' };
  }
}
