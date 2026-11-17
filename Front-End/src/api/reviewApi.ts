import { PatientReview } from '../types';
import { apiRequest } from './httpClient';

export const reviewApi = {
  submit(payload: { patientName: string; rating: number; comment: string }) {
    return apiRequest<PatientReview>('/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  listAdmin() {
    return apiRequest<PatientReview[]>('/admin/reviews');
  },

  setApproved(id: string, approved: boolean) {
    return apiRequest<PatientReview>(`/admin/reviews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ approved }),
    });
  },

  remove(id: string) {
    return apiRequest<boolean>(`/admin/reviews/${id}`, {
      method: 'DELETE',
    });
  },
};
