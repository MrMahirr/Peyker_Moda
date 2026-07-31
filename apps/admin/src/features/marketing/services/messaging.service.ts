import api from '../../../lib/axios';

export type MessagingChannel = 'EMAIL' | 'SMS';
export type MessagingStatus =
    | 'PENDING_PROVIDER'
    | 'QUEUED'
    | 'SENT'
    | 'FAILED';

export interface MessagingChannelStatus {
    channel: MessagingChannel;
    available: boolean;
    reason: string;
}

export interface BulkMessageJob {
    id: string;
    channel: MessagingChannel;
    title: string;
    content: string;
    audience: {
        type: 'ALL_ACTIVE_CUSTOMERS';
        recipientCount: number;
    };
    status: MessagingStatus;
    providerReason: string;
    requestedByUserId: string;
    requestedByName?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBulkMessageDto {
    channel: MessagingChannel;
    title: string;
    content: string;
    audienceType?: 'ALL_ACTIVE_CUSTOMERS';
}

export const messagingService = {
    async getChannelStatuses(): Promise<MessagingChannelStatus[]> {
        const response = await api.get('/messaging/channels');
        return response.data.data;
    },

    async getBulkMessages(): Promise<BulkMessageJob[]> {
        const response = await api.get('/messaging/bulk-messages');
        return response.data.data;
    },

    async createBulkMessage(data: CreateBulkMessageDto): Promise<BulkMessageJob> {
        const response = await api.post('/messaging/bulk-messages', data);
        return response.data.data;
    },
};
