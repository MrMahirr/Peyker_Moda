import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { slugify } from '../../common/utils';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto';
import { CmsStorageService } from './cms-storage.service';
import {
  BlogPostRecord,
  BlogPostResponse,
} from './cms.types';

@Injectable()
export class CmsBlogPostsService {
  constructor(
    private readonly storage: CmsStorageService,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(includeUnpublished = true): Promise<BlogPostResponse[]> {
    const posts = await this.storage.getBlogPosts();
    const filtered = includeUnpublished
      ? posts
      : posts.filter((post) => post.isPublished);
    return this.attachAuthorNames(this.sortPosts(filtered));
  }

  async findPublishedBySlug(slug: string): Promise<BlogPostResponse> {
    const posts = await this.storage.getBlogPosts();
    const post = posts.find(
      (item) => item.slug === slug && item.isPublished,
    );

    if (!post) {
      throw new NotFoundException('Blog yazisi bulunamadi');
    }

    const [response] = await this.attachAuthorNames([post]);
    return response;
  }

  async create(
    dto: CreateBlogPostDto,
    userId: string,
  ): Promise<BlogPostResponse> {
    const posts = await this.storage.getBlogPosts();
    const slug = this.resolveSlug(dto.title, dto.slug);

    if (posts.some((post) => post.slug === slug)) {
      throw new ConflictException('Bu slug ile bir blog yazisi zaten mevcut');
    }

    const now = new Date().toISOString();
    const post: BlogPostRecord = {
      id: randomUUID(),
      title: dto.title.trim(),
      slug,
      excerpt: dto.excerpt.trim(),
      content: dto.content.trim(),
      image: this.optionalString(dto.image),
      isPublished: dto.isPublished ?? false,
      authorId: userId,
      publishedAt: dto.isPublished ? now : undefined,
      createdAt: now,
      updatedAt: now,
    };

    posts.unshift(post);
    await this.storage.saveBlogPosts(posts);

    const [response] = await this.attachAuthorNames([post]);
    return response;
  }

  async update(
    id: string,
    dto: UpdateBlogPostDto,
  ): Promise<BlogPostResponse> {
    const posts = await this.storage.getBlogPosts();
    const index = posts.findIndex((post) => post.id === id);

    if (index === -1) {
      throw new NotFoundException('Blog yazisi bulunamadi');
    }

    const current = posts[index];
    const nextSlug =
      dto.slug !== undefined || dto.title !== undefined
        ? this.resolveSlug(dto.title ?? current.title, dto.slug)
        : current.slug;

    if (posts.some((post) => post.id !== id && post.slug === nextSlug)) {
      throw new ConflictException('Bu slug ile bir blog yazisi zaten mevcut');
    }

    const nextPublished =
      dto.isPublished !== undefined ? dto.isPublished : current.isPublished;

    posts[index] = {
      ...current,
      title: dto.title?.trim() ?? current.title,
      slug: nextSlug,
      excerpt: dto.excerpt?.trim() ?? current.excerpt,
      content: dto.content?.trim() ?? current.content,
      image:
        dto.image !== undefined ? this.optionalString(dto.image) : current.image,
      isPublished: nextPublished,
      publishedAt:
        nextPublished && !current.publishedAt
          ? new Date().toISOString()
          : nextPublished
            ? current.publishedAt
            : undefined,
      updatedAt: new Date().toISOString(),
    };

    await this.storage.saveBlogPosts(posts);
    const [response] = await this.attachAuthorNames([posts[index]]);
    return response;
  }

  async remove(id: string) {
    const posts = await this.storage.getBlogPosts();
    const filtered = posts.filter((post) => post.id !== id);

    if (filtered.length === posts.length) {
      throw new NotFoundException('Blog yazisi bulunamadi');
    }

    await this.storage.saveBlogPosts(filtered);
    return { message: 'Blog yazisi silindi' };
  }

  private resolveSlug(title: string, explicitSlug?: string) {
    return slugify((explicitSlug?.trim() || title.trim()).toLowerCase());
  }

  private optionalString(value?: string) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }

  private sortPosts(posts: BlogPostRecord[]) {
    return [...posts].sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt),
    );
  }

  private async attachAuthorNames(
    posts: BlogPostRecord[],
  ): Promise<BlogPostResponse[]> {
    if (posts.length === 0) {
      return [];
    }

    const userIds = Array.from(new Set(posts.map((post) => post.authorId)));
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    const userMap = new Map(
      users.map((user) => [
        user.id,
        `${user.firstName} ${user.lastName}`.trim() || undefined,
      ]),
    );

    return posts.map((post) => ({
      ...post,
      authorName: userMap.get(post.authorId),
    }));
  }
}
