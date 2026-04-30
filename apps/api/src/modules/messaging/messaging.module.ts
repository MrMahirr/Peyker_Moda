import { Module } from '@nestjs/common';
import { MessagingAudienceService } from './messaging-audience.service';
import { MessagingController } from './messaging.controller';
import { MessagingProviderRegistryService } from './messaging-provider-registry.service';
import { MessagingService } from './messaging.service';
import { MessagingStorageService } from './messaging-storage.service';

@Module({
  controllers: [MessagingController],
  providers: [
    MessagingService,
    MessagingAudienceService,
    MessagingProviderRegistryService,
    MessagingStorageService,
  ],
})
export class MessagingModule {}
