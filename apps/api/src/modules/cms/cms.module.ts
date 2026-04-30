import { Module } from '@nestjs/common';
import { CmsBlogPostsService } from './cms-blog-posts.service';
import { CmsController } from './cms.controller';
import { CmsFaqsService } from './cms-faqs.service';
import { CmsPagesService } from './cms-pages.service';
import { CmsStorageService } from './cms-storage.service';

@Module({
  controllers: [CmsController],
  providers: [
    CmsBlogPostsService,
    CmsPagesService,
    CmsFaqsService,
    CmsStorageService,
  ],
})
export class CmsModule {}
