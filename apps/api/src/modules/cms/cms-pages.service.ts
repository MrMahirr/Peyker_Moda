import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { slugify } from '../../common/utils';
import { CmsStorageService } from './cms-storage.service';
import { CreateCmsPageDto, UpdateCmsPageDto } from './dto';
import { CmsPageRecord } from './cms.types';

@Injectable()
export class CmsPagesService {
  constructor(private readonly storage: CmsStorageService) {}

  async findAll(includeUnpublished = true) {
    const pages = await this.storage.getPages();
    const filtered = includeUnpublished
      ? pages
      : pages.filter((page) => page.isPublished);

    return this.sortPages(filtered);
  }

  async findPublishedBySlug(slug: string) {
    const pages = await this.storage.getPages();
    const page = pages.find((item) => item.slug === slug && item.isPublished);

    if (!page) {
      throw new NotFoundException('Sayfa bulunamadi');
    }

    return page;
  }

  async create(dto: CreateCmsPageDto) {
    const pages = await this.storage.getPages();
    const slug = this.resolveSlug(dto.title, dto.slug);

    if (pages.some((page) => page.slug === slug)) {
      throw new ConflictException('Bu slug ile bir sayfa zaten mevcut');
    }

    const now = new Date().toISOString();
    const page: CmsPageRecord = {
      id: randomUUID(),
      title: dto.title.trim(),
      slug,
      content: dto.content.trim(),
      isPublished: dto.isPublished ?? false,
      isSystem: dto.isSystem ?? false,
      publishedAt: dto.isPublished ? now : undefined,
      createdAt: now,
      updatedAt: now,
    };

    pages.unshift(page);
    await this.storage.savePages(pages);
    return page;
  }

  async update(id: string, dto: UpdateCmsPageDto) {
    const pages = await this.storage.getPages();
    const index = pages.findIndex((page) => page.id === id);

    if (index === -1) {
      throw new NotFoundException('Sayfa bulunamadi');
    }

    const current = pages[index];

    if (current.isSystem && dto.isSystem === false) {
      throw new BadRequestException('Sistem sayfasi sistem disi birakilamaz');
    }

    const nextSlug =
      dto.slug !== undefined || dto.title !== undefined
        ? this.resolveSlug(dto.title ?? current.title, dto.slug)
        : current.slug;

    if (pages.some((page) => page.id !== id && page.slug === nextSlug)) {
      throw new ConflictException('Bu slug ile bir sayfa zaten mevcut');
    }

    const nextPublished =
      dto.isPublished !== undefined ? dto.isPublished : current.isPublished;

    pages[index] = {
      ...current,
      title: dto.title?.trim() ?? current.title,
      slug: nextSlug,
      content: dto.content?.trim() ?? current.content,
      isPublished: nextPublished,
      isSystem: dto.isSystem ?? current.isSystem,
      publishedAt:
        nextPublished && !current.publishedAt
          ? new Date().toISOString()
          : nextPublished
            ? current.publishedAt
            : undefined,
      updatedAt: new Date().toISOString(),
    };

    await this.storage.savePages(pages);
    return pages[index];
  }

  async remove(id: string) {
    const pages = await this.storage.getPages();
    const target = pages.find((page) => page.id === id);

    if (!target) {
      throw new NotFoundException('Sayfa bulunamadi');
    }

    if (target.isSystem) {
      throw new BadRequestException('Sistem sayfasi silinemez');
    }

    await this.storage.savePages(pages.filter((page) => page.id !== id));
    return { message: 'Sayfa silindi' };
  }

  private resolveSlug(title: string, explicitSlug?: string) {
    return slugify((explicitSlug?.trim() || title.trim()).toLowerCase());
  }

  private sortPages(pages: CmsPageRecord[]) {
    return [...pages].sort((left, right) =>
      left.title.localeCompare(right.title),
    );
  }
}
