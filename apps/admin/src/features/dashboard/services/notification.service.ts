import api from '../../../lib/axios';

export interface AppNotification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    time: string;
    read: boolean;
    createdAt: string;
}

export const notificationService = {
    async getRecent(): Promise<AppNotification[]> {
        try {
            // Fetch last 10 audit logs as notifications
            const response = await api.get('/audit-logs?limit=10');
            const logs = response.data?.data || [];
            
            return logs.map((log: any) => ({
                id: log.id,
                type: this.mapActionToType(log.action),
                title: this.formatTitle(log.resource, log.action),
                message: this.formatMessage(log),
                time: this.formatRelativeTime(log.createdAt),
                read: false, // Audit logs don't have a "read" state in DB, we'll keep it local
                createdAt: log.createdAt,
            }));
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            return [];
        }
    },

    mapActionToType(action: string): 'info' | 'success' | 'warning' | 'error' {
        if (action.includes('delete') || action.includes('remove')) return 'error';
        if (action.includes('create') || action.includes('add')) return 'success';
        if (action.includes('update') || action.includes('change')) return 'info';
        return 'info';
    },

    formatTitle(resource: string, action: string): string {
        const resourceMap: Record<string, string> = {
            order: 'Sipariş',
            product: 'Ürün',
            customer: 'Müşteri',
            transaction: 'İşlem',
            variant: 'Varyant',
            user: 'Kullanıcı',
        };
        const actionMap: Record<string, string> = {
            create: 'Oluşturuldu',
            update: 'Güncellendi',
            delete: 'Silindi',
        };
        
        const r = resourceMap[resource.toLowerCase()] || resource;
        const a = actionMap[action.toLowerCase()] || action;
        return `${r} ${a}`;
    },

    formatMessage(log: any): string {
        return `${log.resource} üzerinde ${log.action} işlemi gerçekleştirildi.`;
    },

    formatRelativeTime(dateStr: string): string {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMin = Math.floor(diffInMs / (1000 * 60));
        
        if (diffInMin < 1) return 'Az önce';
        if (diffInMin < 60) return `${diffInMin} dk önce`;
        const diffInHours = Math.floor(diffInMin / 60);
        if (diffInHours < 24) return `${diffInHours} saat önce`;
        return date.toLocaleDateString('tr-TR');
    }
};
