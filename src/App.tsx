import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { OfflineBanner } from './components/ui/States';
import { FixedSiteBackground } from './components/layout/FixedSiteBackground';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { DoctorProfilePage } from './pages/public/DoctorProfilePage';
import { BookingPage } from './pages/public/BookingPage';
import { NotFoundPage } from './pages/public/ErrorPages';

// Auth Pages
import {
  ForgotPasswordPage,
  LoginPage,
  RegisterPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from './pages/auth/AuthPages';
import { AdminLoginPage } from './pages/auth/AdminLoginPage';

// Patient Portal Pages
import { PatientHomePage } from './pages/patient/PatientDashboard';
import { PatientAppointmentsPage } from './pages/patient/AppointmentsPage';
import { PatientBookPage, PatientDoctorPage } from './pages/patient/PatientPortalExtras';
import { PatientProfilePage } from './pages/patient/PatientProfilePage';
import { NotificationsPage } from './pages/shared/NotificationsPage';
import { SettingsPage } from './pages/shared/SettingsPage';

// Private Doctor Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminAppointmentsPage } from './pages/admin/AdminAppointmentsPage';
import { AdminCalendarPage } from './pages/admin/AdminCalendarPage';
import { AdminPatientsPage } from './pages/admin/AdminPatientsPage';
import { AdminAvailabilityPage } from './pages/admin/AdminAvailabilityPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { AdminCertificatesPage } from './pages/admin/AdminCertificatesPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <ToastProvider>
              <AuthProvider>
                <div className="relative min-h-screen">
                  <FixedSiteBackground />
                  <div className="relative z-10 min-h-screen">
                    <BrowserRouter>
                      <OfflineBanner />
                      <Routes>
                    {/* Public */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/doctor" element={<DoctorProfilePage />} />
                    <Route path="/book" element={<BookingPage />} />

                    {/* Patient Auth */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />

                    {/* Patient Portal */}
                    <Route
                      path="/patient/home"
                      element={
                        <ProtectedRoute allowedRoles={['Patient']}>
                          <PatientHomePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/patient/appointments"
                      element={
                        <ProtectedRoute allowedRoles={['Patient']}>
                          <PatientAppointmentsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/patient/book"
                      element={
                        <ProtectedRoute allowedRoles={['Patient']}>
                          <PatientBookPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/patient/doctor"
                      element={
                        <ProtectedRoute allowedRoles={['Patient']}>
                          <PatientDoctorPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/patient/notifications"
                      element={
                        <ProtectedRoute allowedRoles={['Patient']}>
                          <NotificationsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/patient/profile"
                      element={
                        <ProtectedRoute allowedRoles={['Patient']}>
                          <PatientProfilePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/patient/settings"
                      element={
                        <ProtectedRoute allowedRoles={['Patient']}>
                          <SettingsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/patient" element={<Navigate to="/patient/home" replace />} />

                    {/* Private Doctor Admin Entrance (Never linked publicly) */}
                    <Route path="/doctor-admin/login" element={<AdminLoginPage />} />
                    <Route
                      path="/doctor-admin"
                      element={<Navigate to="/doctor-admin/dashboard" replace />}
                    />
                    <Route
                      path="/doctor-admin/dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['Admin']} redirectTo="/doctor-admin/login">
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/doctor-admin/appointments"
                      element={
                        <ProtectedRoute allowedRoles={['Admin']} redirectTo="/doctor-admin/login">
                          <AdminAppointmentsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/doctor-admin/calendar"
                      element={
                        <ProtectedRoute allowedRoles={['Admin']} redirectTo="/doctor-admin/login">
                          <AdminCalendarPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/doctor-admin/patients"
                      element={
                        <ProtectedRoute allowedRoles={['Admin']} redirectTo="/doctor-admin/login">
                          <AdminPatientsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/doctor-admin/availability"
                      element={
                        <ProtectedRoute allowedRoles={['Admin']} redirectTo="/doctor-admin/login">
                          <AdminAvailabilityPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/doctor-admin/reviews"
                      element={
                        <ProtectedRoute allowedRoles={['Admin']} redirectTo="/doctor-admin/login">
                          <AdminReviewsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/doctor-admin/certificates"
                      element={
                        <ProtectedRoute allowedRoles={['Admin']} redirectTo="/doctor-admin/login">
                          <AdminCertificatesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/doctor-admin/analytics"
                      element={
                        <ProtectedRoute allowedRoles={['Admin']} redirectTo="/doctor-admin/login">
                          <AdminAnalyticsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/doctor-admin/profile"
                      element={
                        <ProtectedRoute allowedRoles={['Admin']} redirectTo="/doctor-admin/login">
                          <AdminProfilePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/doctor-admin/settings"
                      element={
                        <ProtectedRoute allowedRoles={['Admin']} redirectTo="/doctor-admin/login">
                          <AdminSettingsPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* 404 */}
                    <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </BrowserRouter>
                  </div>
                </div>
              </AuthProvider>
            </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
