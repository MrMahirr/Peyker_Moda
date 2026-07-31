import { MessagingChannel } from '../messaging.types';

export interface MessagingProviderCapability {
  channel: MessagingChannel;
  available: boolean;
  reason: string;
}

export interface MessagingProvider {
  getCapability(): MessagingProviderCapability;
}
