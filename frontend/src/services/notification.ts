import api from './api';

export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  priority: string;
  is_read: boolean;
  created_at: string;
  link?: string;
  case_id?: number;
}

export const notificationService = {
  getAll: async (skip = 0, limit = 20, unreadOnly = false) => {
    const response = await api.get<Notification[]>('/notifications/', {
      params: { skip, limit, unread_only: unreadOnly }
    });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get<{ count: number }>('/notifications/unread-count');
    return response.data.count;
  },

  markAsRead: async (id: number) => {
    const response = await api.put<Notification>(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put<{ message: string }>('/notifications/read-all');
    return response.data;
  }
};
