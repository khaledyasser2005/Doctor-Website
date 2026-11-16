import { AnalyticsOverview } from '../types';
import { apiRequest } from './httpClient';

const VISITOR_KEY = 'khaled_yasser_visitor_id';

function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = `vis-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return 'web-visitor';
  }
}

export const analyticsApi = {
  track(
    event: 'page_view' | 'profile_view' | 'book_click' | 'whatsapp_click' | 'google_login' | 'register',
    path: string
  ) {
    apiRequest<boolean>('/analytics/event', {
      method: 'POST',
      body: JSON.stringify({ event, path, visitorId: getVisitorId() }),
      skipAuth: true,
    }).catch(() => {});
  },

  getOverview() {
    return apiRequest<AnalyticsOverview>('/admin/analytics');
  },
};
