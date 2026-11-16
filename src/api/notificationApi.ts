import { NotificationItem } from '../types';
import { apiRequest } from './httpClient';

export const notificationApi = {
  list() {
    return apiRequest<NotificationItem[]>('/notifications');
  },

  markRead(id: string) {
    return apiRequest<NotificationItem>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  markAllRead() {
    return apiRequest<boolean>('/notifications/read-all', {
      method: 'PATCH',
    });
  },
};
