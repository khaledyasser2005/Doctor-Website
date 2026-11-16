import { Appointment, AppointmentStatus, ConsultationType } from '../types';
import { apiRequest } from './httpClient';

export const appointmentApi = {
  list() {
    return apiRequest<Appointment[]>('/appointments');
  },

  getById(id: string) {
    return apiRequest<Appointment>(`/appointments/${id}`);
  },

  create(payload: {
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    date: string;
    time: string;
    consultationType: ConsultationType;
    notes?: string;
  }) {
    return apiRequest<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateStatus(id: string, status: AppointmentStatus, rejectionReason?: string) {
    return apiRequest<Appointment>(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rejectionReason }),
    });
  },
};
