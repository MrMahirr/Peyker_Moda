import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CollectionContentStorageService } from './collection-content.storage.service';
import { CollectionContentRecord } from './collection-content.types';

@Injectable()
export class CollectionContentService {
  constructor(private readonly storage: CollectionContentStorageService) {}

  async findAll(includeInactive = false) {
    const contents = await this.storage.getCollectionContents();
    return this.sortContents(
      includeInactive ? contents : contents.filter((c) => c.isActive),
    );
  }

  async findActive() {
    const contents = await this.storage.getCollectionContents();
    return this.sortContents(contents.filter((c) => c.isActive));
  }

  async create(data: Partial<CollectionContentRecord>) {
    const contents = await this.storage.getCollectionContents();

    const position = data.position ?? this.getNextPosition(contents);
    const now = new Date().toISOString();

    const newContent: CollectionContentRecord = {
      id: randomUUID(),
      name: data.name || '',
      imageUrl: data.imageUrl || '',
      slug: data.slug,
      position,
      isActive: data.isActive ?? true,
      updatedAt: now,
    };

    contents.push(newContent);
    const normalized = this.normalizePositions(contents);
    await this.storage.saveCollectionContents(normalized);

    return normalized.find(
      (item) => item.id === newContent.id,
    ) as CollectionContentRecord;
  }

  async update(id: string, data: Partial<CollectionContentRecord>) {
    const contents = await this.storage.getCollectionContents();
    const index = contents.findIndex((c) => c.id === id);

    if (index === -1) {
      throw new NotFoundException('Collection content bulunamadı');
    }

    contents[index] = {
      ...contents[index],
      ...data,
      id, // id cannot be changed
      updatedAt: new Date().toISOString(),
    };

    const normalized = this.normalizePositions(contents);
    await this.storage.saveCollectionContents(normalized);
    return normalized.find((item) => item.id === id) as CollectionContentRecord;
  }

  async remove(id: string) {
    const contents = await this.storage.getCollectionContents();
    const filtered = contents.filter((c) => c.id !== id);

    if (filtered.length === contents.length) {
      throw new NotFoundException('Collection content bulunamadı');
    }

    const normalized = this.normalizePositions(filtered);
    await this.storage.saveCollectionContents(normalized);
    return { message: 'Collection content silindi' };
  }

  private sortContents(contents: CollectionContentRecord[]) {
    return [...contents].sort((left, right) => left.position - right.position);
  }

  private getNextPosition(contents: CollectionContentRecord[]) {
    if (contents.length === 0) return 1;
    return Math.max(...contents.map((c) => c.position)) + 1;
  }

  private normalizePositions(contents: CollectionContentRecord[]) {
    return this.sortContents(contents).map((c, index) => ({
      ...c,
      position: index + 1,
    }));
  }
}
