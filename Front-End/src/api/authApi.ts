import { AuthSession, User } from '../types';
import { apiRequest } from './httpClient';

export const authApi = {
  register(payload: { fullName: string; email: string; phone: string; password: string }) {
    return apiRequest<AuthSession & { verifyToken?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },

  login(payload: { email: string; password: string }) {
    return apiRequest<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },

  loginWithGoogle(idToken: string) {
    return apiRequest<AuthSession>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
      skipAuth: true,
    });
  },

  forgotPassword(email: string) {
    return apiRequest<{ resetRequested: boolean }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
      skipAuth: true,
    });
  },

  resetPassword(payload: { token: string; newPassword: string }) {
    return apiRequest<boolean>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },

  verifyEmail(token: string) {
    return apiRequest<boolean>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
      skipAuth: true,
    });
  },

  me() {
    return apiRequest<User>('/auth/me');
  },

  loginDoctorAdmin(payload: { password: string; email?: string }) {
    return apiRequest<AuthSession>('/doctor-admin/login', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },

  changeDoctorAdminPassword(payload: { currentPassword?: string; newPassword: string }) {
    return apiRequest<User>('/doctor-admin/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
