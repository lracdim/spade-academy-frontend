import api from './axios';

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export const getNotifications = async (): Promise<Notification[]> => {
    const response = await api.get<Notification[]>('/notifications');
    return response.data;
};

export const markNotificationsAsRead = async (notificationId?: string): Promise<void> => {
    await api.post('/notifications/mark-read', { notificationId });
};
