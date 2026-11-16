export type UserRole = 'Patient' | 'Admin';

export type AppointmentStatus =
  | 'Pending'
  | 'Accepted'
  | 'Rejected'
  | 'Cancelled'
  | 'Completed';

export type ConsultationType = 'ClinicVisit' | 'Online';

export type Language = 'en' | 'ar';
export type Theme = 'dark' | 'light';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  authProvider: 'local' | 'google';
  isVerified: boolean;
  isActive: boolean;
  mustChangePassword?: boolean;
  createdAt: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female';
  bloodType?: string;
  allergies?: string;
  notes?: string;
}

export interface AuthSession {
  accessToken: string;
  user: User;
}

export interface DoctorQualification {
  id: string;
  year: string;
  title: string;
  titleAr: string;
  institution: string;
  institutionAr: string;
  description: string;
  descriptionAr: string;
}

export interface DoctorService {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  iconName: string;
}

export interface DoctorProfile {
  fullName: string;
  fullNameAr: string;
  specialty: string;
  specialtyAr: string;
  headline: string;
  headlineAr: string;
  bio: string;
  bioAr: string;
  philosophy: string;
  philosophyAr: string;
  experienceYears: string;
  phone: string;
  whatsapp: string;
  email: string;
  clinicName: string;
  clinicNameAr: string;
  clinicAddress: string;
  clinicAddressAr: string;
  clinicHoursSummary: string;
  clinicHoursSummaryAr: string;
  clinicLatitude: number;
  clinicLongitude: number;
  consultationFeeClinic: number;
  consultationFeeOnline: number;
  currency: string;
  portraitUrl: string;
  conditionsTreated: string[];
  conditionsTreatedAr: string[];
  qualifications: DoctorQualification[];
  services: DoctorService[];
  socialLinks: {
    website?: string;
    linkedin?: string;
    instagram?: string;
  };
}

export interface Certificate {
  id: string;
  title: string;
  titleAr: string;
  institution: string;
  institutionAr: string;
  date: string;
  description: string;
  descriptionAr: string;
  imageUrl: string;
  order: number;
  allowDownload: boolean;
}

export interface PatientReview {
  id: string;
  patientName: string;
  rating: number;
  comment: string;
  commentAr?: string;
  date: string;
  verifiedBooking: boolean;
  approved: boolean;
}

export interface WeeklyShift {
  id: string;
  dayOfWeek: number; // 0 = Sun ... 6 = Sat
  startTime: string; // HH:mm (24h)
  endTime: string;   // HH:mm (24h)
  slotDurationMinutes: number;
}

export interface BlockedSlot {
  id: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // if omitted, whole day blocked
  endTime?: string;
  reason: string;
}

export interface CustomAvailabilityDate {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

export interface AvailabilitySchedule {
  weeklyShifts: WeeklyShift[];
  blockedSlots: BlockedSlot[];
  customDates: CustomAvailabilityDate[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

export interface Appointment {
  id: string;
  bookingCode: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "06:30 PM"
  consultationType: ConsultationType;
  status: AppointmentStatus;
  clinicName: string;
  clinicAddress: string;
  fee: number;
  notes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationItem {
  id: string;
  userId: string; // 'Admin' or specific patient userId
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  type: 'request' | 'accepted' | 'rejected' | 'cancelled' | 'reminder' | 'review' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface AnalyticsOverview {
  summary: {
    totalPatients: number;
    registeredUsers: number;
    totalAppointments: number;
    pendingRequests: number;
    acceptedAppointments: number;
    rejectedAppointments: number;
    cancelledAppointments: number;
    completedAppointments: number;
    revenueToday: number;
    revenueWeek: number;
    revenueMonth: number;
    totalVisitors: number;
    uniqueVisitors: number;
    doctorProfileViews: number;
    bookClicks: number;
    whatsappClicks: number;
    googleLogins: number;
    newAccounts: number;
    conversionRate: number;
    cancellationRate: number;
  };
  visitorsOverTime: Array<{ date: string; visitors: number; uniqueVisitors: number }>;
  appointmentsOverTime: Array<{ date: string; total: number; accepted: number; pending: number }>;
  statusBreakdown: Array<{ status: AppointmentStatus; count: number }>;
  mostRequestedDays: Array<{ day: string; count: number }>;
  popularPages: Array<{ path: string; views: number }>;
}

export interface PublicPracticeBundle {
  doctor: DoctorProfile;
  certificates: Certificate[];
  reviews: PatientReview[];
}
