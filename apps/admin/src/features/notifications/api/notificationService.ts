import axiosInstance from '../../../lib/axios';

export interface Notification {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    link?: string;
    createdAt: string;
}

const notificationService = {
    async getAll(isRead?: boolean) {
        const response = await axiosInstance.get<any>('/notifications', {
            params: { isRead },
        });
        return response.data.data;
    },

    async getUnreadCount() {
        const response = await axiosInstance.get<any>('/notifications/unread-count');
        return response.data.data;
    },

    async markAsRead(id: string) {
        const response = await axiosInstance.patch(`/notifications/${id}/read`);
        return response.data.data;
    },

    async markAllAsRead() {
        const response = await axiosInstance.post('/notifications/read-all');
        return response.data.data;
    },

    async remove(id: string) {
        const response = await axiosInstance.delete(`/notifications/${id}`);
        return response.data.data;
    },
};

export default notificationService;
