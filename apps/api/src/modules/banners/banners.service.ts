import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { BannerStorageService } from './banner.storage.service';
import { CreateBannerDto, UpdateBannerDto } from './dto';
import { BannerRecord } from './banner.types';

@Injectable()
export class BannersService {
  constructor(private readonly storage: BannerStorageService) {}

  async findAll(includeInactive = false) {
    const banners = await this.storage.getBanners();
    return this.sortBanners(
      includeInactive ? banners : banners.filter((banner) => banner.isActive),
    );
  }

  async findActive() {
    const banners = await this.storage.getBanners();
    return this.sortBanners(banners.filter((banner) => banner.isActive));
  }

  async create(dto: CreateBannerDto) {
    const banners = await this.storage.getBanners();

    if (
      banners.some(
        (banner) =>
          banner.title.toLowerCase() === dto.title.trim().toLowerCase(),
      )
    ) {
      throw new ConflictException('Bu baslikta bir banner zaten mevcut');
    }

    const position = dto.position ?? this.getNextPosition(banners);
    const now = new Date().toISOString();
    const banner: BannerRecord = {
      id: randomUUID(),
      title: dto.title.trim(),
      subtitle: dto.subtitle?.trim(),
      imageUrl: dto.imageUrl.trim(),
      linkUrl: dto.linkUrl?.trim() || undefined,
      ctaText: dto.ctaText?.trim(),
      ctaLink: dto.ctaLink?.trim(),
      position,
      isActive: dto.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    banners.push(banner);
    const normalized = this.normalizePositions(banners);
    await this.storage.saveBanners(normalized);

    return normalized.find((item) => item.id === banner.id) as BannerRecord;
  }

  async update(id: string, dto: UpdateBannerDto) {
    const banners = await this.storage.getBanners();
    const index = banners.findIndex((banner) => banner.id === id);

    if (index === -1) {
      throw new NotFoundException('Banner bulunamadi');
    }

    const nextTitle = dto.title?.trim();
    if (
      nextTitle &&
      banners.some(
        (banner) =>
          banner.id !== id &&
          banner.title.toLowerCase() === nextTitle.toLowerCase(),
      )
    ) {
      throw new ConflictException('Bu baslikta bir banner zaten mevcut');
    }

    banners[index] = {
      ...banners[index],
      ...dto,
      title: nextTitle ?? banners[index].title,
      subtitle:
        dto.subtitle !== undefined
          ? dto.subtitle?.trim()
          : banners[index].subtitle,
      imageUrl: dto.imageUrl?.trim() ?? banners[index].imageUrl,
      linkUrl:
        dto.linkUrl !== undefined
          ? dto.linkUrl.trim() || undefined
          : banners[index].linkUrl,
      ctaText:
        dto.ctaText !== undefined
          ? dto.ctaText?.trim()
          : banners[index].ctaText,
      ctaLink:
        dto.ctaLink !== undefined
          ? dto.ctaLink?.trim()
          : banners[index].ctaLink,
      updatedAt: new Date().toISOString(),
    };

    const normalized = this.normalizePositions(banners);
    await this.storage.saveBanners(normalized);
    return normalized.find((item) => item.id === id) as BannerRecord;
  }

  async remove(id: string) {
    const banners = await this.storage.getBanners();
    const filtered = banners.filter((banner) => banner.id !== id);

    if (filtered.length === banners.length) {
      throw new NotFoundException('Banner bulunamadi');
    }

    const normalized = this.normalizePositions(filtered);
    await this.storage.saveBanners(normalized);
    return { message: 'Banner silindi' };
  }

  private sortBanners(banners: BannerRecord[]) {
    return [...banners].sort((left, right) => {
      if (left.position !== right.position) {
        return left.position - right.position;
      }

      return left.createdAt.localeCompare(right.createdAt);
    });
  }

  private getNextPosition(banners: BannerRecord[]) {
    if (banners.length === 0) {
      return 1;
    }

    return Math.max(...banners.map((banner) => banner.position)) + 1;
  }

  private normalizePositions(banners: BannerRecord[]) {
    return this.sortBanners(banners).map((banner, index) => ({
      ...banner,
      position: index + 1,
    }));
  }
}
