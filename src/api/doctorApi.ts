import { DoctorProfile, PublicPracticeBundle } from '../types';
import { apiRequest } from './httpClient';

export const doctorApi = {
  getPublicPractice() {
    return apiRequest<PublicPracticeBundle>('/public/practice', { skipAuth: true });
  },

  getAdminProfile() {
    return apiRequest<DoctorProfile>('/admin/profile');
  },

  updateAdminProfile(updates: Partial<DoctorProfile>) {
    return apiRequest<DoctorProfile>('/admin/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};
