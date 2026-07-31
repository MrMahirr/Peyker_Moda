export enum MessagingChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export enum MessagingAudienceType {
  ALL_ACTIVE_CUSTOMERS = 'ALL_ACTIVE_CUSTOMERS',
}

export enum BulkMessageStatus {
  PENDING_PROVIDER = 'PENDING_PROVIDER',
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

export interface MessagingChannelStatus {
  channel: MessagingChannel;
  available: boolean;
  reason: string;
}

export interface MessagingAudienceSummary {
  type: MessagingAudienceType;
  recipientCount: number;
}

export interface BulkMessageRecord {
  id: string;
  channel: MessagingChannel;
  title: string;
  content: string;
  audience: MessagingAudienceSummary;
  status: BulkMessageStatus;
  providerReason: string;
  requestedByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BulkMessageResponse extends BulkMessageRecord {
  requestedByName?: string;
}
