import { Certificate } from '../types';
import { apiRequest } from './httpClient';

export const certificateApi = {
  listAdmin() {
    return apiRequest<Certificate[]>('/admin/certificates');
  },

  create(payload: Omit<Certificate, 'id'>) {
    return apiRequest<Certificate>('/admin/certificates', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update(id: string, payload: Partial<Certificate>) {
    return apiRequest<Certificate>(`/admin/certificates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  remove(id: string) {
    return apiRequest<boolean>(`/admin/certificates/${id}`, {
      method: 'DELETE',
    });
  },
};
