import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CmsStorageService } from './cms-storage.service';
import { CreateFaqItemDto, UpdateFaqItemDto } from './dto';
import { FaqItemRecord } from './cms.types';

@Injectable()
export class CmsFaqsService {
  constructor(private readonly storage: CmsStorageService) {}

  async findAll(includeInactive = true) {
    const faqs = await this.storage.getFaqs();
    const filtered = includeInactive
      ? faqs
      : faqs.filter((faq) => faq.isActive);

    return this.sortFaqs(filtered);
  }

  async create(dto: CreateFaqItemDto) {
    const faqs = await this.storage.getFaqs();

    if (
      faqs.some(
        (faq) =>
          faq.question.trim().toLowerCase() ===
          dto.question.trim().toLowerCase(),
      )
    ) {
      throw new ConflictException('Bu soru zaten mevcut');
    }

    const now = new Date().toISOString();
    const faq: FaqItemRecord = {
      id: randomUUID(),
      question: dto.question.trim(),
      answer: dto.answer.trim(),
      category: dto.category?.trim() || 'Genel',
      order: dto.order ?? this.getNextOrder(faqs),
      isActive: dto.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    faqs.push(faq);
    const normalized = this.normalizeOrder(faqs);
    await this.storage.saveFaqs(normalized);
    return normalized.find((item) => item.id === faq.id) as FaqItemRecord;
  }

  async update(id: string, dto: UpdateFaqItemDto) {
    const faqs = await this.storage.getFaqs();
    const index = faqs.findIndex((faq) => faq.id === id);

    if (index === -1) {
      throw new NotFoundException('SSS kaydi bulunamadi');
    }

    const normalizedQuestion = dto.question?.trim().toLowerCase();
    if (
      normalizedQuestion &&
      faqs.some(
        (faq) =>
          faq.id !== id &&
          faq.question.trim().toLowerCase() === normalizedQuestion,
      )
    ) {
      throw new ConflictException('Bu soru zaten mevcut');
    }

    faqs[index] = {
      ...faqs[index],
      question: dto.question?.trim() ?? faqs[index].question,
      answer: dto.answer?.trim() ?? faqs[index].answer,
      category:
        dto.category !== undefined
          ? dto.category.trim() || 'Genel'
          : faqs[index].category,
      order: dto.order ?? faqs[index].order,
      isActive: dto.isActive ?? faqs[index].isActive,
      updatedAt: new Date().toISOString(),
    };

    const normalized = this.normalizeOrder(faqs);
    await this.storage.saveFaqs(normalized);
    return normalized.find((item) => item.id === id) as FaqItemRecord;
  }

  async remove(id: string) {
    const faqs = await this.storage.getFaqs();
    const filtered = faqs.filter((faq) => faq.id !== id);

    if (filtered.length === faqs.length) {
      throw new NotFoundException('SSS kaydi bulunamadi');
    }

    await this.storage.saveFaqs(this.normalizeOrder(filtered));
    return { message: 'SSS kaydi silindi' };
  }

  private sortFaqs(faqs: FaqItemRecord[]) {
    return [...faqs].sort((left, right) => {
      if (left.order !== right.order) {
        return left.order - right.order;
      }

      return left.createdAt.localeCompare(right.createdAt);
    });
  }

  private normalizeOrder(faqs: FaqItemRecord[]) {
    return this.sortFaqs(faqs).map((faq, index) => ({
      ...faq,
      order: index + 1,
    }));
  }

  private getNextOrder(faqs: FaqItemRecord[]) {
    if (faqs.length === 0) {
      return 1;
    }

    return Math.max(...faqs.map((faq) => faq.order)) + 1;
  }
}
