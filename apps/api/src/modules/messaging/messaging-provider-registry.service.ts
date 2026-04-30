import { Injectable } from '@nestjs/common';
import {
  MessagingProvider,
  MessagingProviderCapability,
} from './providers/messaging-provider.interface';
import { MessagingChannel } from './messaging.types';

class PendingIntegrationProvider implements MessagingProvider {
  constructor(
    private readonly channel: MessagingChannel,
    private readonly reason: string,
  ) {}

  getCapability(): MessagingProviderCapability {
    return {
      channel: this.channel,
      available: false,
      reason: this.reason,
    };
  }
}

@Injectable()
export class MessagingProviderRegistryService {
  private readonly providers: MessagingProvider[] = [
    new PendingIntegrationProvider(
      MessagingChannel.EMAIL,
      'Toplu e-posta provider entegrasyonu bekleniyor',
    ),
    new PendingIntegrationProvider(
      MessagingChannel.SMS,
      'Toplu SMS provider entegrasyonu bekleniyor',
    ),
  ];

  getCapabilities() {
    return this.providers.map((provider) => provider.getCapability());
  }

  getCapability(channel: MessagingChannel) {
    return this.providers.find(
      (provider) => provider.getCapability().channel === channel,
    )?.getCapability();
  }
}
