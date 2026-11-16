import {
  AvailabilitySchedule,
  BlockedSlot,
  CustomAvailabilityDate,
  TimeSlot,
  WeeklyShift,
} from '../types';
import { apiRequest } from './httpClient';

export const availabilityApi = {
  getSlotsForDate(date: string) {
    return apiRequest<TimeSlot[]>(`/availability/slots?date=${encodeURIComponent(date)}`, {
      skipAuth: true,
    });
  },

  getAdminSchedule() {
    return apiRequest<AvailabilitySchedule>('/admin/availability');
  },

  addShift(payload: Omit<WeeklyShift, 'id'>) {
    return apiRequest<WeeklyShift>('/admin/availability/shifts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  removeShift(id: string) {
    return apiRequest<boolean>(`/admin/availability/shifts/${id}`, {
      method: 'DELETE',
    });
  },

  addBlockedSlot(payload: Omit<BlockedSlot, 'id'>) {
    return apiRequest<BlockedSlot>('/admin/availability/blocked', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  removeBlockedSlot(id: string) {
    return apiRequest<boolean>(`/admin/availability/blocked/${id}`, {
      method: 'DELETE',
    });
  },

  addCustomDate(payload: Omit<CustomAvailabilityDate, 'id'>) {
    return apiRequest<CustomAvailabilityDate>('/admin/availability/custom-dates', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  removeCustomDate(id: string) {
    return apiRequest<boolean>(`/admin/availability/custom-dates/${id}`, {
      method: 'DELETE',
    });
  },
};
