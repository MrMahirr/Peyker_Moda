import { Injectable } from '@nestjs/common';
import {
  MessagingProvider,
  MessagingProviderCapability,
} from './providers/messaging-provider.interface';
import { MessagingChannel } from './messaging.types';

class ActiveIntegrationProvider implements MessagingProvider {
  constructor(
    private readonly channel: MessagingChannel,
    private readonly reason: string,
  ) {}

  getCapability(): MessagingProviderCapability {
    return {
      channel: this.channel,
      available: true,
      reason: this.reason,
    };
  }
}

class DisabledIntegrationProvider implements MessagingProvider {
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
    new ActiveIntegrationProvider(
      MessagingChannel.EMAIL,
      'E-posta provider aktif (Native Queue)',
    ),
    new DisabledIntegrationProvider(
      MessagingChannel.SMS,
      'Toplu SMS özelliği geçici olarak deaktif bırakıldı',
    ),
  ];

  getCapabilities() {
    return this.providers.map((provider) => provider.getCapability());
  }

  getCapability(channel: MessagingChannel) {
    return this.providers
      .find((provider) => provider.getCapability().channel === channel)
      ?.getCapability();
  }
}
