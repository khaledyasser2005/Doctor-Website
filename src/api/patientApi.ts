import { Appointment, User } from '../types';
import { apiRequest } from './httpClient';

export interface PatientSummary extends User {
  appointmentCount: number;
  lastAppointmentDate: string | null;
}

export const patientApi = {
  getMyProfile() {
    return apiRequest<User>('/patient/profile');
  },

  updateMyProfile(payload: Partial<User>) {
    return apiRequest<User>('/patient/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  listAdminPatients() {
    return apiRequest<PatientSummary[]>('/admin/patients');
  },

  getAdminPatientDetail(id: string) {
    return apiRequest<{ patient: User; appointments: Appointment[] }>(`/admin/patients/${id}`);
  },

  setAdminPatientActive(id: string, isActive: boolean) {
    return apiRequest<User>(`/admin/patients/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  },
};
