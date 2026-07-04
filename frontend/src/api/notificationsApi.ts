import api from './client';
import type { Notification } from '../types';

export const notificationsApi = {
  getNotifications: async (unreadOnly = false): Promise<{ notifications: Notification[]; unreadCount: number; total: number }> => {
    const res = await api.get<{ success: true; data: { notifications: Notification[]; unreadCount: number; total: number } }>(
      `/notifications${unreadOnly ? '?unread=true' : ''}`
    );
    return res.data.data;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const res = await api.patch<{ success: true; data: { notification: Notification } }>(`/notifications/${id}/read`);
    return res.data.data.notification;
  },

  markAllAsRead: async () => {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },
};
