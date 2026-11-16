import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import type {
  AnalyticsOverview,
  Appointment,
  AppointmentStatus,
  AvailabilitySchedule,
  BlockedSlot,
  Certificate,
  ConsultationType,
  CustomAvailabilityDate,
  DoctorProfile,
  NotificationItem,
  PatientReview,
  TimeSlot,
  User,
  WeeklyShift,
} from './src/types/index.ts';

interface StoredUser extends User {
  passwordHash?: string;
}

interface AnalyticsEventRecord {
  id: string;
  event: 'page_view' | 'profile_view' | 'book_click' | 'whatsapp_click' | 'google_login' | 'register';
  path: string;
  visitorId: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

interface PracticeDatabase {
  users: StoredUser[];
  doctor: DoctorProfile;
  certificates: Certificate[];
  reviews: PatientReview[];
  availability: AvailabilitySchedule;
  appointments: Appointment[];
  notifications: NotificationItem[];
  analyticsEvents: AnalyticsEventRecord[];
  resetTokens: Record<string, { userId: string; expiresAt: number }>;
  verifyTokens: Record<string, { userId: string; expiresAt: number }>;
}

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'practice-db.json');
const TOKEN_SECRET =
  process.env.SESSION_SECRET || 'khaled_yasser_private_practice_signing_key_v1';

const PORTRAIT_URL = '/src/assets/images/clinic_hero_showcase_1794870794499.jpg';
const CERT_IMAGE_URL = '/src/assets/images/certificate_credential_card_1794869557096.jpg';

function isoDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function hashPassword(plain: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(plain, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(plain: string, storedHash?: string): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, originalHex] = storedHash.split(':');
  if (!salt || !originalHex) return false;
  const derived = crypto.scryptSync(plain, salt, 64);
  const original = Buffer.from(originalHex, 'hex');
  if (derived.length !== original.length) return false;
  return crypto.timingSafeEqual(derived, original);
}

function signToken(payload: { sub: string; role: string; exp: number }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

function verifyToken(token: string): { sub: string; role: string; exp: number } | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as {
      sub: string;
      role: string;
      exp: number;
    };
    if (Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

function sanitizeUser(u: StoredUser): User {
  const { passwordHash: _ignored, ...rest } = u;
  return rest;
}

function createInitialDatabase(): PracticeDatabase {
  const initialAdminPassword = process.env.DOCTOR_ADMIN_INITIAL_PASSWORD || '0000';
  const adminEmail = process.env.DOCTOR_ADMIN_EMAIL || 'admin@drkhaledyasser.com';

  const adminUser: StoredUser = {
    id: 'usr-admin-khaled',
    fullName: 'Dr. Khaled Yasser',
    email: adminEmail,
    phone: '+20 12 85566897',
    role: 'Admin',
    authProvider: 'local',
    isVerified: true,
    isActive: true,
    mustChangePassword: true,
    createdAt: new Date(Date.now() - 86400000 * 120).toISOString(),
    passwordHash: hashPassword(initialAdminPassword),
  };

  const patient1: StoredUser = {
    id: 'usr-patient-1',
    fullName: 'Omar Abdelrahman',
    email: 'omar.abdelrahman@example.com',
    phone: '+20 10 1234 5678',
    role: 'Patient',
    authProvider: 'local',
    isVerified: true,
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 35).toISOString(),
    dateOfBirth: '1991-06-14',
    gender: 'Male',
    bloodType: 'O+',
    allergies: 'None reported',
    notes: 'Prefers evening clinic appointments.',
    passwordHash: hashPassword('Patient123!'),
  };

  const patient2: StoredUser = {
    id: 'usr-patient-2',
    fullName: 'Salma El-Sherif',
    email: 'salma.elsherif@example.com',
    phone: '+20 11 9876 5432',
    role: 'Patient',
    authProvider: 'local',
    isVerified: true,
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
    dateOfBirth: '1995-03-22',
    gender: 'Female',
    bloodType: 'A+',
    allergies: 'Penicillin',
    notes: 'Follow-up online consultations.',
    passwordHash: hashPassword('Patient123!'),
  };

  const patient3: StoredUser = {
    id: 'usr-patient-3',
    fullName: 'Karim Mansour',
    email: 'karim.mansour@example.com',
    phone: '+20 12 4455 7788',
    role: 'Patient',
    authProvider: 'google',
    isVerified: true,
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
    dateOfBirth: '1988-11-03',
    gender: 'Male',
    passwordHash: hashPassword('Patient123!'),
  };

  const doctor: DoctorProfile = {
    fullName: 'Dr. Khaled Yasser',
    fullNameAr: 'د. خالد ياسر',
    specialty: '[Doctor Specialty]',
    specialtyAr: '[التخصص الطبي]',
    headline: 'Private Medical Consultation & Patient-Centered Care',
    headlineAr: 'استشارات طبية خاصة ورعاية صحية متكاملة',
    bio: 'Committed to calm, attentive clinical evaluations and evidence-based medical guidance. Every consultation is structured to give patients clear answers, unhurried discussion, and a dependable follow-up plan.',
    bioAr:
      'ملتزم بتقديم تقييم سريري دقيق ورعاية طبية قائمة على الأدلة العلمية، مع منح كل مريض الوقت الكافي للشرح الواضح وخطة متابعة موثوقة.',
    philosophy:
      'Clear communication is central to effective medicine. By combining thorough assessment with respectful, transparent dialogue, patients leave every consultation confident in their next steps.',
    philosophyAr:
      'التواصل الواضح ركيزة أساسية في الممارسة الطبية. نحرص على الفحص الدقيق والحوار الصريح ليخرج كل مريض بفهم كامل لخطة علاجه.',
    experienceYears: '[Experience]',
    phone: '+20 12 85566897',
    whatsapp: '+20 12 85566897',
    email: 'clinic@alshifaclinic-banha.com',
    clinicName: 'Al-Shifa Medical Clinic',
    clinicNameAr: 'عيادة الشفاء الطبية',
    clinicAddress: 'Banha, Qalyubia, Egypt',
    clinicAddressAr: 'بنها، القليوبية، مصر',
    clinicHoursSummary: 'Sat – Thu · 10:00 AM – 9:00 PM',
    clinicHoursSummaryAr: 'السبت – الخميس · ١٠:٠٠ ص – ٩:٠٠ م',
    clinicLatitude: 30.466,
    clinicLongitude: 31.1848,
    consultationFeeClinic: 500,
    consultationFeeOnline: 400,
    currency: 'EGP',
    portraitUrl: PORTRAIT_URL,
    conditionsTreated: [
      'Comprehensive Diagnostic Consultation',
      'Chronic Condition Management & Follow-Up',
      'Preventive Health & Risk Assessment',
      'Second-Opinion Case Review',
      'Post-Visit Treatment Adjustment',
      'Lab & Diagnostic Report Interpretation',
    ],
    conditionsTreatedAr: [
      'الاستشارة التشخيصية الشاملة',
      'متابعة وإدارة الحالات المزمنة',
      'الفحص الوقائي وتقييم المخاطر الصحية',
      'مراجعة التقارير الطبية والرأي الطبي الثاني',
      'تعديل الخطة العلاجية بعد الكشف',
      'تفسير نتائج التحاليل والفحوصات',
    ],
    qualifications: [
      {
        id: 'qual-2018',
        year: '2018',
        title: '[Medical Degree]',
        titleAr: '[الدرجة الطبية الأساسية]',
        institution: '[Medical University / Faculty of Medicine]',
        institutionAr: '[كلية الطب / الجامعة]',
        description: 'Foundational medical training with clinical rotations across core hospital departments.',
        descriptionAr: 'التدريب الطبي الأساسي والتناوب السريري في الأقسام الطبية الرئيسية.',
      },
      {
        id: 'qual-2020',
        year: '2020',
        title: 'Clinical Residency & Specialist Training',
        titleAr: 'الإقامة الطبية والتدريب التخصصي',
        institution: '[Teaching Hospital / Medical Center]',
        institutionAr: '[المستشفى التعليمي / المركز الطبي]',
        description: 'Focused inpatient and outpatient diagnostic training under senior specialist supervision.',
        descriptionAr: 'تدريب سريري مكثف في العيادات الخارجية والأقسام الداخلية.',
      },
      {
        id: 'qual-2022',
        year: '2022',
        title: 'Postgraduate Specialist Qualification',
        titleAr: 'مؤهل التخصص العالي / الزمالة',
        institution: '[Accredited Medical Board]',
        institutionAr: '[الهيئة الطبية المعتمدة]',
        description: 'Advanced clinical competency in [Doctor Specialty] diagnostics and long-term care.',
        descriptionAr: 'كفاءة سريرية متقدمة في تشخيص ومتابعة حالات [التخصص الطبي].',
      },
      {
        id: 'qual-2024',
        year: '2024',
        title: 'Specialist Medical Clinic — Banha',
        titleAr: 'العيادة الطبية التخصصية — بنها',
        institution: 'Al-Shifa Medical Clinic',
        institutionAr: 'عيادة الشفاء الطبية',
        description: 'Direct in-clinic and online consultations in Banha built around calm, thorough patient care.',
        descriptionAr: 'استشارات طبية مباشرة وعن بُعد في بنها تركز على دقة التشخيص وراحة المريض.',
      },
    ],
    services: [
      {
        id: 'srv-1',
        name: 'In-Clinic Comprehensive Consultation',
        nameAr: 'كشف سريري شامل بالعيادة',
        description: 'Complete face-to-face clinical evaluation, medical history review, and personalized care plan.',
        descriptionAr: 'تقييم سريري متكامل ومراجعة التاريخ المرضي ووضع خطة علاجية مخصصة.',
        iconName: 'Stethoscope',
      },
      {
        id: 'srv-2',
        name: 'Online Medical Consultation',
        nameAr: 'استشارة طبية عبر الإنترنت',
        description: 'Remote consultation for report review, follow-up questions, and timely guidance.',
        descriptionAr: 'استشارة عن بُعد لمراجعة الفحوصات والمتابعة الدورية وتقديم الإرشاد الطبي.',
        iconName: 'Video',
      },
      {
        id: 'srv-3',
        name: 'Diagnostic & Report Review',
        nameAr: 'مراجعة التحاليل والتقارير',
        description: 'Detailed interpretation of laboratory work, imaging, and prior clinical records.',
        descriptionAr: 'قراءة وتفسير دقيق لنتائج التحاليل الطبية والأشعة والتقارير السابقة.',
        iconName: 'FileCheck2',
      },
      {
        id: 'srv-4',
        name: 'Structured Follow-Up Care',
        nameAr: 'متابعة علاجية منظمة',
        description: 'Ongoing monitoring to track recovery milestones and refine therapy safely.',
        descriptionAr: 'متابعة مستمرة لتقييم التحسن وضبط الخطة العلاجية بأمان.',
        iconName: 'HeartPulse',
      },
    ],
    socialLinks: {
      website: '',
      linkedin: '',
      instagram: '',
    },
  };

  const certificates: Certificate[] = [
    {
      id: 'cert-1',
      title: '[Medical Degree] Certificate',
      titleAr: 'شهادة [الدرجة الطبية]',
      institution: '[Medical University]',
      institutionAr: '[الجامعة الطبية]',
      date: '2018',
      description: 'Official medical qualification certificate ready to be updated with verified institutional details.',
      descriptionAr: 'شهادة المؤهل الطبي الأساسية قابلة للتعديل من لوحة التحكم الخاصة بالطبيب.',
      imageUrl: CERT_IMAGE_URL,
      order: 1,
      allowDownload: true,
    },
    {
      id: 'cert-2',
      title: '[Doctor Specialty] Fellowship Credential',
      titleAr: 'شهادة الزمالة في [التخصص الطبي]',
      institution: '[Accredited Medical Board]',
      institutionAr: '[المجلس الطبي المعتمد]',
      date: '2022',
      description: 'Specialist training accreditation and board certification record.',
      descriptionAr: 'اعتماد التدريب التخصصي والشهادة المهنية الموثقة.',
      imageUrl: CERT_IMAGE_URL,
      order: 2,
      allowDownload: true,
    },
    {
      id: 'cert-3',
      title: 'Clinical Excellence & Continuing Education',
      titleAr: 'شهادة التعليم الطبي المستمر',
      institution: '[Medical Association]',
      institutionAr: '[الجمعية الطبية]',
      date: '2024',
      description: 'Continuing medical education and clinical standards certification.',
      descriptionAr: 'اعتماد التعليم الطبي المستمر وتطبيق معايير الجودة السريرية.',
      imageUrl: CERT_IMAGE_URL,
      order: 3,
      allowDownload: true,
    },
  ];

  const reviews: PatientReview[] = [
    {
      id: 'rev-1',
      patientName: 'Omar A.',
      rating: 5,
      comment:
        'Very calm and attentive consultation. The doctor took time to explain every detail clearly and answered all my questions.',
      commentAr:
        'استشارة هادئة ومريحة للغاية. الطبيب استمع لكل التفاصيل وشرح الخطة العلاجية بوضوح.',
      date: isoDateOffset(-14),
      verifiedBooking: true,
      approved: true,
    },
    {
      id: 'rev-2',
      patientName: 'Salma E.',
      rating: 5,
      comment:
        'Booking was seamless and the online follow-up was punctual and thorough. Highly recommended.',
      commentAr:
        'الحجز كان سهلاً جداً والاستشارة عن بُعد تمت في موعدها بكل دقة واهتمام.',
      date: isoDateOffset(-8),
      verifiedBooking: true,
      approved: true,
    },
    {
      id: 'rev-3',
      patientName: 'Karim M.',
      rating: 5,
      comment:
        'Clean, calm clinic atmosphere and organized scheduling without long waiting times.',
      commentAr:
        'العيادة هادئة ومنظمة والمواعيد دقيقة بدون انتظار طويل.',
      date: isoDateOffset(-4),
      verifiedBooking: true,
      approved: true,
    },
    {
      id: 'rev-4',
      patientName: 'Nour H.',
      rating: 5,
      comment: 'Respectful care and quick confirmation via WhatsApp.',
      commentAr: 'تعامل راقٍ وتأكيد سريع عبر واتساب.',
      date: isoDateOffset(-1),
      verifiedBooking: false,
      approved: false,
    },
  ];

  const weeklyShifts: WeeklyShift[] = [
    { id: 'sh-sat-1', dayOfWeek: 6, startTime: '10:00', endTime: '14:00', slotDurationMinutes: 30 },
    { id: 'sh-sat-2', dayOfWeek: 6, startTime: '17:00', endTime: '21:00', slotDurationMinutes: 30 },
    { id: 'sh-sun-1', dayOfWeek: 0, startTime: '10:00', endTime: '14:00', slotDurationMinutes: 30 },
    { id: 'sh-sun-2', dayOfWeek: 0, startTime: '17:00', endTime: '21:00', slotDurationMinutes: 30 },
    { id: 'sh-mon-1', dayOfWeek: 1, startTime: '10:00', endTime: '14:00', slotDurationMinutes: 30 },
    { id: 'sh-mon-2', dayOfWeek: 1, startTime: '17:00', endTime: '21:00', slotDurationMinutes: 30 },
    { id: 'sh-tue-1', dayOfWeek: 2, startTime: '10:00', endTime: '14:00', slotDurationMinutes: 30 },
    { id: 'sh-tue-2', dayOfWeek: 2, startTime: '17:00', endTime: '21:00', slotDurationMinutes: 30 },
    { id: 'sh-wed-1', dayOfWeek: 3, startTime: '10:00', endTime: '14:00', slotDurationMinutes: 30 },
    { id: 'sh-wed-2', dayOfWeek: 3, startTime: '17:00', endTime: '21:00', slotDurationMinutes: 30 },
    { id: 'sh-thu-1', dayOfWeek: 4, startTime: '10:00', endTime: '14:00', slotDurationMinutes: 30 },
  ];

  const appointments: Appointment[] = [
    {
      id: 'apt-101',
      bookingCode: 'KY-2601',
      patientId: patient1.id,
      patientName: patient1.fullName,
      patientEmail: patient1.email,
      patientPhone: patient1.phone,
      date: isoDateOffset(1),
      time: '06:00 PM',
      consultationType: 'ClinicVisit',
      status: 'Pending',
      clinicName: doctor.clinicName,
      clinicAddress: doctor.clinicAddress,
      fee: doctor.consultationFeeClinic,
      notes: 'Initial evaluation and lab review.',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'apt-102',
      bookingCode: 'KY-2602',
      patientId: patient2.id,
      patientName: patient2.fullName,
      patientEmail: patient2.email,
      patientPhone: patient2.phone,
      date: isoDateOffset(1),
      time: '11:30 AM',
      consultationType: 'Online',
      status: 'Accepted',
      clinicName: doctor.clinicName,
      clinicAddress: 'Online Consultation',
      fee: doctor.consultationFeeOnline,
      notes: 'Follow-up review of recent blood work.',
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
    {
      id: 'apt-103',
      bookingCode: 'KY-2603',
      patientId: patient3.id,
      patientName: patient3.fullName,
      patientEmail: patient3.email,
      patientPhone: patient3.phone,
      date: isoDateOffset(2),
      time: '05:30 PM',
      consultationType: 'ClinicVisit',
      status: 'Pending',
      clinicName: doctor.clinicName,
      clinicAddress: doctor.clinicAddress,
      fee: doctor.consultationFeeClinic,
      notes: 'General specialist consultation.',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'apt-104',
      bookingCode: 'KY-2594',
      patientId: patient1.id,
      patientName: patient1.fullName,
      patientEmail: patient1.email,
      patientPhone: patient1.phone,
      date: isoDateOffset(-5),
      time: '12:00 PM',
      consultationType: 'ClinicVisit',
      status: 'Completed',
      clinicName: doctor.clinicName,
      clinicAddress: doctor.clinicAddress,
      fee: doctor.consultationFeeClinic,
      notes: 'First visit completed.',
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
      id: 'apt-105',
      bookingCode: 'KY-2590',
      patientId: patient2.id,
      patientName: patient2.fullName,
      patientEmail: patient2.email,
      patientPhone: patient2.phone,
      date: isoDateOffset(-3),
      time: '07:00 PM',
      consultationType: 'Online',
      status: 'Rejected',
      clinicName: doctor.clinicName,
      clinicAddress: 'Online Consultation',
      fee: doctor.consultationFeeOnline,
      rejectionReason: 'Requested time overlapped with a clinical procedure; please select an afternoon slot.',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ];

  const notifications: NotificationItem[] = [
    {
      id: 'ntf-1',
      userId: 'Admin',
      title: 'New Appointment Request',
      titleAr: 'طلب حجز موعد جديد',
      description: `${patient1.fullName} requested a Clinic Visit on ${isoDateOffset(1)} at 06:00 PM.`,
      descriptionAr: `طلب ${patient1.fullName} حجز زيارة عيادة بتاريخ ${isoDateOffset(1)} الساعة 06:00 PM.`,
      type: 'request',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'ntf-2',
      userId: 'Admin',
      title: 'Pending Patient Review',
      titleAr: 'تقييم جديد بانتظار المراجعة',
      description: 'Nour H. submitted a 5-star review awaiting approval.',
      descriptionAr: 'أضافت نور تقييماً جديداً بانتظار الموافقة.',
      type: 'review',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 'ntf-3',
      userId: patient2.id,
      title: 'Appointment Accepted',
      titleAr: 'تم قبول موعدك',
      description: `Al-Shifa Medical Clinic confirmed your Online Consultation (${isoDateOffset(1)} at 11:30 AM).`,
      descriptionAr: `أكدت عيادة الشفاء الطبية موعد استشارتك عبر الإنترنت (${isoDateOffset(1)} الساعة 11:30 AM).`,
      type: 'accepted',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    },
  ];

  // Seed 14 days of realistic baseline analytics events
  const analyticsEvents: AnalyticsEventRecord[] = [];
  for (let i = 13; i >= 0; i--) {
    const day = isoDateOffset(-i);
    const baseViews = 18 + ((13 - i) % 5) * 4;
    for (let v = 0; v < baseViews; v++) {
      const visitorId = `vis-${day}-${v % Math.max(8, Math.floor(baseViews * 0.68))}`;
      analyticsEvents.push({
        id: `ev-${day}-${v}`,
        event: v % 6 === 0 ? 'profile_view' : 'page_view',
        path: v % 4 === 0 ? '/book' : v % 6 === 0 ? '/doctor' : '/',
        visitorId,
        date: day,
        createdAt: `${day}T12:00:00.000Z`,
      });
    }
    if (i % 2 === 0) {
      analyticsEvents.push({
        id: `ev-wa-${day}`,
        event: 'whatsapp_click',
        path: '/',
        visitorId: `vis-${day}-1`,
        date: day,
        createdAt: `${day}T14:00:00.000Z`,
      });
      analyticsEvents.push({
        id: `ev-bk-${day}`,
        event: 'book_click',
        path: '/book',
        visitorId: `vis-${day}-2`,
        date: day,
        createdAt: `${day}T15:00:00.000Z`,
      });
    }
  }

  return {
    users: [adminUser, patient1, patient2, patient3],
    doctor,
    certificates,
    reviews,
    availability: {
      weeklyShifts,
      blockedSlots: [],
      customDates: [],
    },
    appointments,
    notifications,
    analyticsEvents,
    resetTokens: {},
    verifyTokens: {},
  };
}

function loadDatabase(): PracticeDatabase {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    const initial = createInitialDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw) as PracticeDatabase;
  } catch {
    const initial = createInitialDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
}

let db: PracticeDatabase = loadDatabase();

function saveDatabase(): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

function toMinutes(hhmm: string): number {
  const clean = hhmm.trim();
  const ampmMatch = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampmMatch) {
    let h = Number(ampmMatch[1]);
    const m = Number(ampmMatch[2]);
    const period = ampmMatch[3].toUpperCase();
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  }
  const [hStr, mStr] = clean.split(':');
  return Number(hStr) * 60 + Number(mStr);
}

function formatMinutes12h(totalMinutes: number): string {
  const h24 = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${String(h12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
}

function computeSlotsForDate(dateStr: string): TimeSlot[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return [];
  const parsed = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return [];

  // Check whole-day block
  const dayBlocks = db.availability.blockedSlots.filter((b) => b.date === dateStr);
  if (dayBlocks.some((b) => !b.startTime)) {
    return [];
  }

  // Custom date overrides weekly shifts if configured
  const customForDate = db.availability.customDates.filter((c) => c.date === dateStr);
  const dayOfWeek = parsed.getDay();
  const windows =
    customForDate.length > 0
      ? customForDate.map((c) => ({
          startTime: c.startTime,
          endTime: c.endTime,
          slotDurationMinutes: c.slotDurationMinutes || 30,
        }))
      : db.availability.weeklyShifts
          .filter((s) => s.dayOfWeek === dayOfWeek)
          .map((s) => ({
            startTime: s.startTime,
            endTime: s.endTime,
            slotDurationMinutes: s.slotDurationMinutes || 30,
          }));

  if (windows.length === 0) return [];

  const activeBookings = new Set(
    db.appointments
      .filter((a) => a.date === dateStr && (a.status === 'Pending' || a.status === 'Accepted'))
      .map((a) => a.time)
  );

  const now = new Date();
  const todayStr = isoDateOffset(0);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const seenTimes = new Set<number>();
  const slots: TimeSlot[] = [];

  for (const w of windows) {
    const startMin = toMinutes(w.startTime);
    const endMin = toMinutes(w.endTime);
    const step = Math.max(15, w.slotDurationMinutes || 30);

    for (let t = startMin; t + step <= endMin; t += step) {
      if (seenTimes.has(t)) continue;
      seenTimes.add(t);

      const label = formatMinutes12h(t);
      let available = true;
      let reason: string | undefined;

      if (dateStr < todayStr || (dateStr === todayStr && t <= nowMinutes + 15)) {
        available = false;
        reason = 'Past time';
      } else if (activeBookings.has(label)) {
        available = false;
        reason = 'Booked';
      } else {
        for (const blk of dayBlocks) {
          if (blk.startTime && blk.endTime) {
            const bStart = toMinutes(blk.startTime);
            const bEnd = toMinutes(blk.endTime);
            if (t >= bStart && t < bEnd) {
              available = false;
              reason = blk.reason || 'Blocked';
              break;
            }
          }
        }
      }

      slots.push({ time: label, available, reason });
    }
  }

  return slots.sort((a, b) => toMinutes(a.time) - toMinutes(b.time));
}

interface AuthedRequest extends Request {
  authUser?: StoredUser;
}

function getTokenFromHeader(req: Request): string | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return auth.slice(7).trim();
}

function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction): void {
  const token = getTokenFromHeader(req);
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      const user = db.users.find((u) => u.id === payload.sub);
      if (user && user.isActive) {
        req.authUser = user;
      }
    }
  }
  next();
}

function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const token = getTokenFromHeader(req);
  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
    return;
  }
  const user = db.users.find((u) => u.id === payload.sub);
  if (!user) {
    res.status(401).json({ success: false, message: 'Account no longer exists.' });
    return;
  }
  if (!user.isActive) {
    res.status(403).json({ success: false, message: 'This account has been deactivated.' });
    return;
  }
  req.authUser = user;
  next();
}

function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (!req.authUser || req.authUser.role !== 'Admin') {
      res.status(403).json({ success: false, message: 'Forbidden: Doctor Admin access required.' });
      return;
    }
    next();
  });
}

function recordAnalyticsEvent(
  event: AnalyticsEventRecord['event'],
  eventPath: string,
  visitorId: string
): void {
  const now = new Date();
  const date = isoDateOffset(0);
  db.analyticsEvents.push({
    id: `ev-${crypto.randomUUID()}`,
    event,
    path: eventPath || '/',
    visitorId: visitorId || 'anon',
    date,
    createdAt: now.toISOString(),
  });
  if (db.analyticsEvents.length > 5000) {
    db.analyticsEvents = db.analyticsEvents.slice(-5000);
  }
  saveDatabase();
}

function buildAnalyticsOverview(): AnalyticsOverview {
  const patients = db.users.filter((u) => u.role === 'Patient');
  const appts = db.appointments;

  const pendingRequests = appts.filter((a) => a.status === 'Pending').length;
  const acceptedAppointments = appts.filter((a) => a.status === 'Accepted').length;
  const rejectedAppointments = appts.filter((a) => a.status === 'Rejected').length;
  const cancelledAppointments = appts.filter((a) => a.status === 'Cancelled').length;
  const completedAppointments = appts.filter((a) => a.status === 'Completed').length;

  const today = isoDateOffset(0);
  const weekAgo = isoDateOffset(-7);
  const monthAgo = isoDateOffset(-30);

  const revenueStatuses = new Set<AppointmentStatus>(['Accepted', 'Completed']);
  const revenueToday = appts
    .filter((a) => a.date === today && revenueStatuses.has(a.status))
    .reduce((sum, a) => sum + a.fee, 0);
  const revenueWeek = appts
    .filter((a) => a.date >= weekAgo && revenueStatuses.has(a.status))
    .reduce((sum, a) => sum + a.fee, 0);
  const revenueMonth = appts
    .filter((a) => a.date >= monthAgo && revenueStatuses.has(a.status))
    .reduce((sum, a) => sum + a.fee, 0);

  const viewEvents = db.analyticsEvents.filter((e) => e.event === 'page_view' || e.event === 'profile_view');
  const uniqueVisitorSet = new Set(viewEvents.map((e) => e.visitorId));
  const doctorProfileViews = db.analyticsEvents.filter((e) => e.event === 'profile_view').length;
  const bookClicks = db.analyticsEvents.filter((e) => e.event === 'book_click').length;
  const whatsappClicks = db.analyticsEvents.filter((e) => e.event === 'whatsapp_click').length;
  const googleLogins = db.analyticsEvents.filter((e) => e.event === 'google_login').length;
  const newAccounts = patients.filter((p) => p.createdAt >= new Date(Date.now() - 86400000 * 30).toISOString()).length;

  const totalVisitors = viewEvents.length;
  const uniqueVisitors = uniqueVisitorSet.size;
  const conversionRate = uniqueVisitors > 0 ? Number(((appts.length / uniqueVisitors) * 100).toFixed(1)) : 0;
  const cancellationRate =
    appts.length > 0 ? Number((((cancelledAppointments + rejectedAppointments) / appts.length) * 100).toFixed(1)) : 0;

  // Last 14 days visitors & appointments
  const visitorsOverTime: AnalyticsOverview['visitorsOverTime'] = [];
  const appointmentsOverTime: AnalyticsOverview['appointmentsOverTime'] = [];

  for (let i = 13; i >= 0; i--) {
    const d = isoDateOffset(-i);
    const dayViews = viewEvents.filter((e) => e.date === d);
    const dayUnique = new Set(dayViews.map((e) => e.visitorId));
    visitorsOverTime.push({
      date: d,
      visitors: dayViews.length,
      uniqueVisitors: dayUnique.size,
    });

    const dayAppts = appts.filter((a) => a.date === d || a.createdAt.slice(0, 10) === d);
    appointmentsOverTime.push({
      date: d,
      total: dayAppts.length,
      accepted: dayAppts.filter((a) => a.status === 'Accepted' || a.status === 'Completed').length,
      pending: dayAppts.filter((a) => a.status === 'Pending').length,
    });
  }

  const statusBreakdown: AnalyticsOverview['statusBreakdown'] = [
    { status: 'Pending', count: pendingRequests },
    { status: 'Accepted', count: acceptedAppointments },
    { status: 'Completed', count: completedAppointments },
    { status: 'Rejected', count: rejectedAppointments },
    { status: 'Cancelled', count: cancelledAppointments },
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayCounts = new Array<number>(7).fill(0);
  for (const a of appts) {
    const dt = new Date(`${a.date}T12:00:00`);
    if (!Number.isNaN(dt.getTime())) {
      dayCounts[dt.getDay()] += 1;
    }
  }
  const mostRequestedDays = dayNames.map((day, idx) => ({ day, count: dayCounts[idx] }));

  const pageMap = new Map<string, number>();
  for (const e of viewEvents) {
    pageMap.set(e.path, (pageMap.get(e.path) || 0) + 1);
  }
  const popularPages = Array.from(pageMap.entries())
    .map(([p, views]) => ({ path: p, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);

  return {
    summary: {
      totalPatients: patients.length,
      registeredUsers: patients.length,
      totalAppointments: appts.length,
      pendingRequests,
      acceptedAppointments,
      rejectedAppointments,
      cancelledAppointments,
      completedAppointments,
      revenueToday,
      revenueWeek,
      revenueMonth,
      totalVisitors,
      uniqueVisitors,
      doctorProfileViews,
      bookClicks,
      whatsappClicks,
      googleLogins,
      newAccounts,
      conversionRate,
      cancellationRate,
    },
    visitorsOverTime,
    appointmentsOverTime,
    statusBreakdown,
    mostRequestedDays,
    popularPages,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '8mb' }));

  // Health
  app.get('/api/health', (_req, res) => {
    res.json({ success: true, message: 'OK', data: { status: 'healthy', timestamp: new Date().toISOString() } });
  });

  // Public practice bundle (doctor profile, certificates sorted, approved reviews only)
  app.get('/api/public/practice', (_req, res) => {
    const certificates = [...db.certificates].sort((a, b) => a.order - b.order);
    const reviews = db.reviews.filter((r) => r.approved).sort((a, b) => b.date.localeCompare(a.date));
    res.json({
      success: true,
      message: 'Practice data loaded',
      data: {
        doctor: db.doctor,
        certificates,
        reviews,
      },
    });
  });

  // Analytics tracker (public)
  app.post('/api/analytics/event', (req, res) => {
    const { event, path: eventPath, visitorId } = req.body as {
      event?: AnalyticsEventRecord['event'];
      path?: string;
      visitorId?: string;
    };
    const allowed = new Set(['page_view', 'profile_view', 'book_click', 'whatsapp_click', 'google_login', 'register']);
    if (!event || !allowed.has(event)) {
      res.status(400).json({ success: false, message: 'Invalid analytics event type.' });
      return;
    }
    recordAnalyticsEvent(event, eventPath || '/', visitorId || 'web-visitor');
    res.json({ success: true, message: 'Recorded', data: true });
  });

  // Patient Registration
  app.post('/api/auth/register', (req, res) => {
    const { fullName, email, phone, password } = req.body as {
      fullName?: string;
      email?: string;
      phone?: string;
      password?: string;
    };
    if (!fullName || !email || !phone || !password) {
      res.status(400).json({ success: false, message: 'Full name, email, phone, and password are required.' });
      return;
    }
    if (password.length < 6) {
      res.status(422).json({ success: false, message: 'Password must be at least 6 characters.' });
      return;
    }
    const normEmail = email.trim().toLowerCase();
    if (db.users.some((u) => u.email.toLowerCase() === normEmail)) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const newUser: StoredUser = {
      id: `usr-${crypto.randomUUID().slice(0, 8)}`,
      fullName: fullName.trim(),
      email: normEmail,
      phone: phone.trim(),
      role: 'Patient',
      authProvider: 'local',
      isVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      passwordHash: hashPassword(password),
    };
    const verifyCode = crypto.randomBytes(16).toString('hex');
    db.verifyTokens[verifyCode] = { userId: newUser.id, expiresAt: Date.now() + 86400000 };
    db.users.push(newUser);
    recordAnalyticsEvent('register', '/register', newUser.id);
    saveDatabase();

    const accessToken = signToken({
      sub: newUser.id,
      role: newUser.role,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: { accessToken, user: sanitizeUser(newUser), verifyToken: verifyCode },
    });
  });

  // Patient Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }
    const normEmail = email.trim().toLowerCase();
    const user = db.users.find((u) => u.email.toLowerCase() === normEmail && u.role === 'Patient');
    if (!user || !verifyPassword(password, user.passwordHash)) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }
    if (!user.isActive) {
      res.status(403).json({ success: false, message: 'Account is deactivated. Please contact the clinic.' });
      return;
    }
    const accessToken = signToken({
      sub: user.id,
      role: user.role,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
    });
    res.json({
      success: true,
      message: 'Signed in successfully.',
      data: { accessToken, user: sanitizeUser(user) },
    });
  });

  // Real Google OAuth verification (Firebase Auth idToken or GIS credential)
  app.post('/api/auth/google', async (req, res) => {
    const { idToken, credential } = req.body as { idToken?: string; credential?: string };
    const rawToken = idToken || credential;
    if (!rawToken) {
      res.status(400).json({ success: false, message: 'Google ID token is required.' });
      return;
    }

    try {
      let verifiedEmail: string | undefined;
      let isEmailVerified = false;
      let displayName: string | undefined;
      let photoUrl: string | undefined;

      let firebaseApiKey = process.env.FIREBASE_API_KEY || '';
      if (!firebaseApiKey) {
        try {
          const cfgPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
          if (fs.existsSync(cfgPath)) {
            const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8')) as { apiKey?: string };
            firebaseApiKey = cfg.apiKey || '';
          }
        } catch {
          // ignore config parse failure
        }
      }

      if (firebaseApiKey && idToken) {
        const fbResp = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseApiKey)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          }
        );
        if (!fbResp.ok) {
          res.status(401).json({ success: false, message: 'Google Firebase token verification failed.' });
          return;
        }
        const fbData = (await fbResp.json()) as {
          users?: Array<{
            email?: string;
            emailVerified?: boolean;
            displayName?: string;
            photoUrl?: string;
          }>;
        };
        const fbUser = fbData.users?.[0];
        if (!fbUser) {
          res.status(401).json({ success: false, message: 'No matching Google user account found.' });
          return;
        }
        verifiedEmail = fbUser.email;
        isEmailVerified = Boolean(fbUser.emailVerified);
        displayName = fbUser.displayName;
        photoUrl = fbUser.photoUrl;
      } else {
        const verifyResp = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(rawToken)}`
        );
        if (!verifyResp.ok) {
          res.status(401).json({ success: false, message: 'Google token verification failed.' });
          return;
        }
        const tokenInfo = (await verifyResp.json()) as {
          aud?: string;
          email?: string;
          email_verified?: string;
          name?: string;
          picture?: string;
        };

        const expectedClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
        if (expectedClientId && tokenInfo.aud !== expectedClientId) {
          res.status(401).json({ success: false, message: 'Google Client ID mismatch.' });
          return;
        }
        verifiedEmail = tokenInfo.email;
        isEmailVerified = tokenInfo.email_verified === 'true';
        displayName = tokenInfo.name;
        photoUrl = tokenInfo.picture;
      }

      if (!verifiedEmail || !isEmailVerified) {
        res.status(401).json({ success: false, message: 'Google account email is not verified.' });
        return;
      }

      const normEmail = verifiedEmail.toLowerCase();
      let user = db.users.find((u) => u.email.toLowerCase() === normEmail);

      if (user && user.role === 'Admin') {
        res.status(403).json({
          success: false,
          message: 'Administrator access requires the private doctor login portal.',
        });
        return;
      }

      if (!user) {
        user = {
          id: `usr-${crypto.randomUUID().slice(0, 8)}`,
          fullName: displayName || normEmail.split('@')[0],
          email: normEmail,
          phone: '',
          role: 'Patient',
          avatarUrl: photoUrl,
          authProvider: 'google',
          isVerified: true,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        db.users.push(user);
      } else {
        user.avatarUrl = photoUrl || user.avatarUrl;
        user.fullName = user.fullName || displayName || normEmail.split('@')[0];
        user.isVerified = true;
      }

      if (!user.isActive) {
        res.status(403).json({ success: false, message: 'Account is deactivated.' });
        return;
      }

      recordAnalyticsEvent('google_login', '/login', user.id);
      saveDatabase();

      const accessToken = signToken({
        sub: user.id,
        role: user.role,
        exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
      });

      res.json({
        success: true,
        message: 'Signed in with Google.',
        data: { accessToken, user: sanitizeUser(user) },
      });
    } catch {
      res.status(500).json({ success: false, message: 'Unable to verify Google Sign-In at this time.' });
    }
  });

  // Forgot & Reset Password
  app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body as { email?: string };
    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required.' });
      return;
    }
    const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.role === 'Patient');
    let devToken: string | undefined;
    if (user) {
      devToken = crypto.randomBytes(16).toString('hex');
      db.resetTokens[devToken] = { userId: user.id, expiresAt: Date.now() + 3600000 };
      saveDatabase();
    }
    res.json({
      success: true,
      message: 'If a matching patient account exists, password reset instructions have been prepared.',
      data: { resetRequested: true },
    });
  });

  app.post('/api/auth/reset-password', (req, res) => {
    const { token, newPassword } = req.body as { token?: string; newPassword?: string };
    if (!token || !newPassword || newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'Valid reset token and password (6+ chars) required.' });
      return;
    }
    const record = db.resetTokens[token];
    if (!record || record.expiresAt < Date.now()) {
      res.status(400).json({ success: false, message: 'Reset link is invalid or has expired.' });
      return;
    }
    const user = db.users.find((u) => u.id === record.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }
    user.passwordHash = hashPassword(newPassword);
    delete db.resetTokens[token];
    saveDatabase();
    res.json({ success: true, message: 'Password updated successfully.', data: true });
  });

  app.post('/api/auth/verify-email', (req, res) => {
    const { token } = req.body as { token?: string };
    if (!token) {
      res.status(400).json({ success: false, message: 'Verification token is required.' });
      return;
    }
    const record = db.verifyTokens[token];
    if (!record || record.expiresAt < Date.now()) {
      res.status(400).json({ success: false, message: 'Verification token is invalid or expired.' });
      return;
    }
    const user = db.users.find((u) => u.id === record.userId);
    if (user) {
      user.isVerified = true;
      delete db.verifyTokens[token];
      saveDatabase();
    }
    res.json({ success: true, message: 'Email verified successfully.', data: true });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthedRequest, res) => {
    res.json({ success: true, message: 'Authenticated user', data: sanitizeUser(req.authUser!) });
  });

  // Private Doctor Admin Authentication
  app.post('/api/doctor-admin/login', (req, res) => {
    const { password, email } = req.body as { password?: string; email?: string };
    if (!password) {
      res.status(400).json({ success: false, message: 'Administrator password is required.' });
      return;
    }
    const admin = db.users.find((u) => u.role === 'Admin');
    if (!admin) {
      res.status(500).json({ success: false, message: 'Administrator account not provisioned.' });
      return;
    }
    if (email && email.trim().toLowerCase() !== admin.email.toLowerCase()) {
      res.status(401).json({ success: false, message: 'Invalid administrator credentials.' });
      return;
    }
    if (!verifyPassword(password, admin.passwordHash)) {
      res.status(401).json({ success: false, message: 'Invalid administrator password.' });
      return;
    }
    const accessToken = signToken({
      sub: admin.id,
      role: admin.role,
      exp: Date.now() + 1000 * 60 * 60 * 12,
    });
    res.json({
      success: true,
      message: 'Doctor admin authenticated.',
      data: { accessToken, user: sanitizeUser(admin) },
    });
  });

  app.post('/api/doctor-admin/change-password', requireAdmin, (req: AuthedRequest, res) => {
    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };
    const admin = req.authUser!;
    if (!newPassword || newPassword.length < 6) {
      res.status(422).json({ success: false, message: 'New password must be at least 6 characters.' });
      return;
    }
    if (!admin.mustChangePassword) {
      if (!currentPassword || !verifyPassword(currentPassword, admin.passwordHash)) {
        res.status(401).json({ success: false, message: 'Current password is incorrect.' });
        return;
      }
    }
    admin.passwordHash = hashPassword(newPassword);
    admin.mustChangePassword = false;
    saveDatabase();

    res.json({
      success: true,
      message: 'Administrator password updated successfully.',
      data: sanitizeUser(admin),
    });
  });

  // Availability Slots (Public)
  app.get('/api/availability/slots', (req, res) => {
    const date = String(req.query.date || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ success: false, message: 'Valid date (YYYY-MM-DD) is required.' });
      return;
    }
    const slots = computeSlotsForDate(date);
    res.json({ success: true, message: 'Slots loaded', data: slots });
  });

  // Appointments
  app.get('/api/appointments', requireAuth, (req: AuthedRequest, res) => {
    const user = req.authUser!;
    const list =
      user.role === 'Admin'
        ? db.appointments
        : db.appointments.filter((a) => a.patientId === user.id || a.patientEmail.toLowerCase() === user.email.toLowerCase());
    const sorted = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    res.json({ success: true, message: 'Appointments loaded', data: sorted });
  });

  app.get('/api/appointments/:id', requireAuth, (req: AuthedRequest, res) => {
    const user = req.authUser!;
    const apt = db.appointments.find((a) => a.id === req.params.id);
    if (!apt) {
      res.status(404).json({ success: false, message: 'Appointment not found.' });
      return;
    }
    if (
      user.role !== 'Admin' &&
      apt.patientId !== user.id &&
      apt.patientEmail.toLowerCase() !== user.email.toLowerCase()
    ) {
      res.status(403).json({ success: false, message: 'Forbidden: You cannot view this appointment.' });
      return;
    }
    res.json({ success: true, message: 'Appointment loaded', data: apt });
  });

  app.post('/api/appointments', optionalAuth, (req: AuthedRequest, res) => {
    const {
      patientName,
      patientEmail,
      patientPhone,
      date,
      time,
      consultationType,
      notes,
    } = req.body as {
      patientName?: string;
      patientEmail?: string;
      patientPhone?: string;
      date?: string;
      time?: string;
      consultationType?: ConsultationType;
      notes?: string;
    };

    if (!patientName || !patientEmail || !patientPhone || !date || !time || !consultationType) {
      res.status(400).json({ success: false, message: 'All appointment fields are required.' });
      return;
    }

    const slots = computeSlotsForDate(date);
    const matchedSlot = slots.find((s) => s.time === time);
    if (!matchedSlot || !matchedSlot.available) {
      res.status(409).json({
        success: false,
        message: 'This time slot is no longer available. Please pick another open time.',
      });
      return;
    }

    // Link patient account if signed in or matching email
    const normEmail = patientEmail.trim().toLowerCase();
    let linkedUser = req.authUser && req.authUser.role === 'Patient'
      ? req.authUser
      : db.users.find((u) => u.email.toLowerCase() === normEmail && u.role === 'Patient');

    const fee =
      consultationType === 'Online' ? db.doctor.consultationFeeOnline : db.doctor.consultationFeeClinic;

    const newAppointment: Appointment = {
      id: `apt-${crypto.randomUUID().slice(0, 8)}`,
      bookingCode: `KY-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: linkedUser ? linkedUser.id : `guest-${crypto.randomUUID().slice(0, 6)}`,
      patientName: patientName.trim(),
      patientEmail: normEmail,
      patientPhone: patientPhone.trim(),
      date,
      time,
      consultationType,
      status: 'Pending',
      clinicName: db.doctor.clinicName,
      clinicAddress: consultationType === 'Online' ? 'Online Consultation' : db.doctor.clinicAddress,
      fee,
      notes: notes?.trim(),
      createdAt: new Date().toISOString(),
    };

    db.appointments.unshift(newAppointment);

    db.notifications.unshift({
      id: `ntf-${crypto.randomUUID().slice(0, 8)}`,
      userId: 'Admin',
      title: 'New Appointment Request',
      titleAr: 'طلب حجز موعد جديد',
      description: `${newAppointment.patientName} requested ${
        consultationType === 'Online' ? 'Online Consultation' : 'Clinic Visit'
      } on ${date} at ${time}.`,
      descriptionAr: `طلب ${newAppointment.patientName} ${
        consultationType === 'Online' ? 'استشارة عن بُعد' : 'زيارة العيادة'
      } بتاريخ ${date} الساعة ${time}.`,
      type: 'request',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    if (linkedUser) {
      db.notifications.unshift({
        id: `ntf-${crypto.randomUUID().slice(0, 8)}`,
        userId: linkedUser.id,
        title: 'Appointment Request Sent',
        titleAr: 'تم إرسال طلب الحجز',
        description: `Your booking request (${newAppointment.bookingCode}) for ${date} at ${time} is Pending review.`,
        descriptionAr: `طلب حجزك (${newAppointment.bookingCode}) بتاريخ ${date} الساعة ${time} قيد المراجعة.`,
        type: 'request',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    saveDatabase();
    res.status(201).json({
      success: true,
      message: 'Appointment request submitted.',
      data: newAppointment,
    });
  });

  app.patch('/api/appointments/:id/status', requireAuth, (req: AuthedRequest, res) => {
    const user = req.authUser!;
    const apt = db.appointments.find((a) => a.id === req.params.id);
    if (!apt) {
      res.status(404).json({ success: false, message: 'Appointment not found.' });
      return;
    }

    const { status, rejectionReason } = req.body as {
      status?: AppointmentStatus;
      rejectionReason?: string;
    };

    if (!status) {
      res.status(400).json({ success: false, message: 'Status is required.' });
      return;
    }

    if (user.role !== 'Admin') {
      const owns =
        apt.patientId === user.id || apt.patientEmail.toLowerCase() === user.email.toLowerCase();
      if (!owns) {
        res.status(403).json({ success: false, message: 'Forbidden: Cannot update another patient appointment.' });
        return;
      }
      if (status !== 'Cancelled' || (apt.status !== 'Pending' && apt.status !== 'Accepted')) {
        res.status(403).json({ success: false, message: 'Patients may only cancel Pending or Accepted appointments.' });
        return;
      }
    }

    if (status === 'Rejected' && (!rejectionReason || !rejectionReason.trim())) {
      res.status(422).json({ success: false, message: 'Please provide a rejection reason.' });
      return;
    }

    apt.status = status;
    if (status === 'Rejected' && rejectionReason) {
      apt.rejectionReason = rejectionReason.trim();
    }
    apt.updatedAt = new Date().toISOString();

    // Create notification
    if (user.role === 'Admin') {
      const notifType =
        status === 'Accepted'
          ? 'accepted'
          : status === 'Rejected'
          ? 'rejected'
          : status === 'Cancelled'
          ? 'cancelled'
          : 'system';

      if (apt.patientId && !apt.patientId.startsWith('guest-')) {
        db.notifications.unshift({
          id: `ntf-${crypto.randomUUID().slice(0, 8)}`,
          userId: apt.patientId,
          title: `Appointment ${status}`,
          titleAr: `تحديث حالة الموعد: ${status}`,
          description:
            status === 'Rejected'
              ? `Your appointment (${apt.bookingCode}) was declined: ${apt.rejectionReason}`
              : `Your appointment (${apt.bookingCode}) on ${apt.date} at ${apt.time} is now ${status}.`,
          descriptionAr:
            status === 'Rejected'
              ? `تم رفض موعدك (${apt.bookingCode}): ${apt.rejectionReason}`
              : `تم تحديث حالة موعدك (${apt.bookingCode}) إلى ${status}.`,
          type: notifType,
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }
    } else {
      db.notifications.unshift({
        id: `ntf-${crypto.randomUUID().slice(0, 8)}`,
        userId: 'Admin',
        title: 'Appointment Cancelled by Patient',
        titleAr: 'إلغاء موعد من المريض',
        description: `${apt.patientName} cancelled appointment ${apt.bookingCode} (${apt.date} ${apt.time}).`,
        descriptionAr: `قام ${apt.patientName} بإلغاء الموعد ${apt.bookingCode}.`,
        type: 'cancelled',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    saveDatabase();
    res.json({ success: true, message: `Appointment updated to ${status}.`, data: apt });
  });

  // Notifications
  app.get('/api/notifications', requireAuth, (req: AuthedRequest, res) => {
    const user = req.authUser!;
    const targetId = user.role === 'Admin' ? 'Admin' : user.id;
    const list = db.notifications
      .filter((n) => n.userId === targetId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    res.json({ success: true, message: 'Notifications loaded', data: list });
  });

  app.patch('/api/notifications/:id/read', requireAuth, (req: AuthedRequest, res) => {
    const user = req.authUser!;
    const targetId = user.role === 'Admin' ? 'Admin' : user.id;
    const item = db.notifications.find((n) => n.id === req.params.id && n.userId === targetId);
    if (!item) {
      res.status(404).json({ success: false, message: 'Notification not found.' });
      return;
    }
    item.isRead = true;
    saveDatabase();
    res.json({ success: true, message: 'Marked as read', data: item });
  });

  app.patch('/api/notifications/read-all', requireAuth, (req: AuthedRequest, res) => {
    const user = req.authUser!;
    const targetId = user.role === 'Admin' ? 'Admin' : user.id;
    db.notifications.forEach((n) => {
      if (n.userId === targetId) n.isRead = true;
    });
    saveDatabase();
    res.json({ success: true, message: 'All marked as read', data: true });
  });

  // Patient Profile
  app.get('/api/patient/profile', requireAuth, (req: AuthedRequest, res) => {
    res.json({ success: true, message: 'Profile loaded', data: sanitizeUser(req.authUser!) });
  });

  app.put('/api/patient/profile', requireAuth, (req: AuthedRequest, res) => {
    const user = req.authUser!;
    const { fullName, phone, dateOfBirth, gender, bloodType, allergies, notes } = req.body as Partial<User>;
    if (fullName !== undefined) user.fullName = fullName.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (gender !== undefined) user.gender = gender;
    if (bloodType !== undefined) user.bloodType = bloodType;
    if (allergies !== undefined) user.allergies = allergies;
    if (notes !== undefined) user.notes = notes;
    saveDatabase();
    res.json({ success: true, message: 'Profile updated.', data: sanitizeUser(user) });
  });

  // Public Review submission
  app.post('/api/reviews', optionalAuth, (req: AuthedRequest, res) => {
    const { patientName, rating, comment } = req.body as {
      patientName?: string;
      rating?: number;
      comment?: string;
    };
    const finalName = patientName?.trim() || req.authUser?.fullName;
    if (!finalName || !comment || !rating || rating < 1 || rating > 5) {
      res.status(400).json({ success: false, message: 'Name, rating (1-5), and comment are required.' });
      return;
    }

    const hasVerifiedBooking = req.authUser
      ? db.appointments.some((a) => a.patientId === req.authUser!.id && (a.status === 'Completed' || a.status === 'Accepted'))
      : false;

    const review: PatientReview = {
      id: `rev-${crypto.randomUUID().slice(0, 8)}`,
      patientName: finalName,
      rating: Math.round(rating),
      comment: comment.trim(),
      date: isoDateOffset(0),
      verifiedBooking: hasVerifiedBooking,
      approved: false,
    };
    db.reviews.unshift(review);

    db.notifications.unshift({
      id: `ntf-${crypto.randomUUID().slice(0, 8)}`,
      userId: 'Admin',
      title: 'New Patient Review Submitted',
      titleAr: 'تم إرسال تقييم مريض جديد',
      description: `${finalName} submitted a ${review.rating}-star review awaiting moderation.`,
      descriptionAr: `أرسل ${finalName} تقييماً جديداً بانتظار المراجعة.`,
      type: 'review',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    saveDatabase();
    res.status(201).json({
      success: true,
      message: 'Review submitted for approval. Thank you for your feedback.',
      data: review,
    });
  });

  // ===== DOCTOR ADMIN ENDPOINTS =====
  app.get('/api/admin/analytics', requireAdmin, (_req, res) => {
    res.json({ success: true, message: 'Analytics loaded', data: buildAnalyticsOverview() });
  });

  app.get('/api/admin/profile', requireAdmin, (_req, res) => {
    res.json({ success: true, message: 'Doctor profile loaded', data: db.doctor });
  });

  app.put('/api/admin/profile', requireAdmin, (req, res) => {
    const updates = req.body as Partial<DoctorProfile>;
    db.doctor = {
      ...db.doctor,
      ...updates,
      // Always keep official portrait unless explicitly overridden by another valid string
      portraitUrl: updates.portraitUrl?.trim() || db.doctor.portraitUrl || PORTRAIT_URL,
    };
    saveDatabase();
    res.json({ success: true, message: 'Doctor profile updated.', data: db.doctor });
  });

  app.get('/api/admin/certificates', requireAdmin, (_req, res) => {
    const sorted = [...db.certificates].sort((a, b) => a.order - b.order);
    res.json({ success: true, message: 'Certificates loaded', data: sorted });
  });

  app.post('/api/admin/certificates', requireAdmin, (req, res) => {
    const body = req.body as Partial<Certificate>;
    if (!body.title || !body.institution || !body.date) {
      res.status(400).json({ success: false, message: 'Title, institution, and date are required.' });
      return;
    }
    const maxOrder = db.certificates.reduce((m, c) => Math.max(m, c.order), 0);
    const cert: Certificate = {
      id: `cert-${crypto.randomUUID().slice(0, 8)}`,
      title: body.title.trim(),
      titleAr: body.titleAr?.trim() || body.title.trim(),
      institution: body.institution.trim(),
      institutionAr: body.institutionAr?.trim() || body.institution.trim(),
      date: body.date.trim(),
      description: body.description?.trim() || '',
      descriptionAr: body.descriptionAr?.trim() || body.description?.trim() || '',
      imageUrl: body.imageUrl?.trim() || CERT_IMAGE_URL,
      order: body.order ?? maxOrder + 1,
      allowDownload: body.allowDownload ?? true,
    };
    db.certificates.push(cert);
    saveDatabase();
    res.status(201).json({ success: true, message: 'Certificate added.', data: cert });
  });

  app.put('/api/admin/certificates/:id', requireAdmin, (req, res) => {
    const idx = db.certificates.findIndex((c) => c.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ success: false, message: 'Certificate not found.' });
      return;
    }
    db.certificates[idx] = { ...db.certificates[idx], ...(req.body as Partial<Certificate>) };
    saveDatabase();
    res.json({ success: true, message: 'Certificate updated.', data: db.certificates[idx] });
  });

  app.delete('/api/admin/certificates/:id', requireAdmin, (req, res) => {
    const before = db.certificates.length;
    db.certificates = db.certificates.filter((c) => c.id !== req.params.id);
    if (db.certificates.length === before) {
      res.status(404).json({ success: false, message: 'Certificate not found.' });
      return;
    }
    saveDatabase();
    res.json({ success: true, message: 'Certificate deleted.', data: true });
  });

  app.get('/api/admin/reviews', requireAdmin, (_req, res) => {
    const sorted = [...db.reviews].sort((a, b) => b.date.localeCompare(a.date));
    res.json({ success: true, message: 'Reviews loaded', data: sorted });
  });

  app.patch('/api/admin/reviews/:id', requireAdmin, (req, res) => {
    const rev = db.reviews.find((r) => r.id === req.params.id);
    if (!rev) {
      res.status(404).json({ success: false, message: 'Review not found.' });
      return;
    }
    const { approved } = req.body as { approved?: boolean };
    if (approved !== undefined) rev.approved = approved;
    saveDatabase();
    res.json({ success: true, message: 'Review status updated.', data: rev });
  });

  app.delete('/api/admin/reviews/:id', requireAdmin, (req, res) => {
    const before = db.reviews.length;
    db.reviews = db.reviews.filter((r) => r.id !== req.params.id);
    if (db.reviews.length === before) {
      res.status(404).json({ success: false, message: 'Review not found.' });
      return;
    }
    saveDatabase();
    res.json({ success: true, message: 'Review deleted.', data: true });
  });

  // Availability Admin
  app.get('/api/admin/availability', requireAdmin, (_req, res) => {
    res.json({ success: true, message: 'Availability loaded', data: db.availability });
  });

  app.post('/api/admin/availability/shifts', requireAdmin, (req, res) => {
    const { dayOfWeek, startTime, endTime, slotDurationMinutes } = req.body as Partial<WeeklyShift>;
    if (dayOfWeek === undefined || !startTime || !endTime) {
      res.status(400).json({ success: false, message: 'Day, start time, and end time required.' });
      return;
    }
    const shift: WeeklyShift = {
      id: `sh-${crypto.randomUUID().slice(0, 6)}`,
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
      slotDurationMinutes: Number(slotDurationMinutes) || 30,
    };
    db.availability.weeklyShifts.push(shift);
    saveDatabase();
    res.status(201).json({ success: true, message: 'Shift added.', data: shift });
  });

  app.delete('/api/admin/availability/shifts/:id', requireAdmin, (req, res) => {
    db.availability.weeklyShifts = db.availability.weeklyShifts.filter((s) => s.id !== req.params.id);
    saveDatabase();
    res.json({ success: true, message: 'Shift removed.', data: true });
  });

  app.post('/api/admin/availability/blocked', requireAdmin, (req, res) => {
    const { date, startTime, endTime, reason } = req.body as Partial<BlockedSlot>;
    if (!date) {
      res.status(400).json({ success: false, message: 'Date is required.' });
      return;
    }
    const blocked: BlockedSlot = {
      id: `blk-${crypto.randomUUID().slice(0, 6)}`,
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      reason: reason?.trim() || 'Unavailable',
    };
    db.availability.blockedSlots.push(blocked);
    saveDatabase();
    res.status(201).json({ success: true, message: 'Blocked time saved.', data: blocked });
  });

  app.delete('/api/admin/availability/blocked/:id', requireAdmin, (req, res) => {
    db.availability.blockedSlots = db.availability.blockedSlots.filter((b) => b.id !== req.params.id);
    saveDatabase();
    res.json({ success: true, message: 'Blocked time removed.', data: true });
  });

  app.post('/api/admin/availability/custom-dates', requireAdmin, (req, res) => {
    const { date, startTime, endTime, slotDurationMinutes } = req.body as Partial<CustomAvailabilityDate>;
    if (!date || !startTime || !endTime) {
      res.status(400).json({ success: false, message: 'Date, start time, and end time required.' });
      return;
    }
    const custom: CustomAvailabilityDate = {
      id: `cst-${crypto.randomUUID().slice(0, 6)}`,
      date,
      startTime,
      endTime,
      slotDurationMinutes: Number(slotDurationMinutes) || 30,
    };
    db.availability.customDates.push(custom);
    saveDatabase();
    res.status(201).json({ success: true, message: 'Custom hours added.', data: custom });
  });

  app.delete('/api/admin/availability/custom-dates/:id', requireAdmin, (req, res) => {
    db.availability.customDates = db.availability.customDates.filter((c) => c.id !== req.params.id);
    saveDatabase();
    res.json({ success: true, message: 'Custom date removed.', data: true });
  });

  // Patients Admin
  app.get('/api/admin/patients', requireAdmin, (_req, res) => {
    const patients = db.users
      .filter((u) => u.role === 'Patient')
      .map((u) => {
        const userAppts = db.appointments.filter(
          (a) => a.patientId === u.id || a.patientEmail.toLowerCase() === u.email.toLowerCase()
        );
        return {
          ...sanitizeUser(u),
          appointmentCount: userAppts.length,
          lastAppointmentDate: userAppts[0]?.date || null,
        };
      });
    res.json({ success: true, message: 'Patients loaded', data: patients });
  });

  app.get('/api/admin/patients/:id', requireAdmin, (req, res) => {
    const patient = db.users.find((u) => u.id === req.params.id && u.role === 'Patient');
    if (!patient) {
      res.status(404).json({ success: false, message: 'Patient not found.' });
      return;
    }
    const appointments = db.appointments
      .filter((a) => a.patientId === patient.id || a.patientEmail.toLowerCase() === patient.email.toLowerCase())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    res.json({
      success: true,
      message: 'Patient details loaded',
      data: { patient: sanitizeUser(patient), appointments },
    });
  });

  app.patch('/api/admin/patients/:id/status', requireAdmin, (req, res) => {
    const patient = db.users.find((u) => u.id === req.params.id && u.role === 'Patient');
    if (!patient) {
      res.status(404).json({ success: false, message: 'Patient not found.' });
      return;
    }
    const { isActive } = req.body as { isActive?: boolean };
    if (isActive === undefined) {
      res.status(400).json({ success: false, message: 'isActive boolean is required.' });
      return;
    }
    patient.isActive = isActive;
    saveDatabase();
    res.json({
      success: true,
      message: isActive ? 'Patient account activated.' : 'Patient account deactivated.',
      data: sanitizeUser(patient),
    });
  });

  // Unknown API routes return structured JSON 404
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ success: false, message: 'API endpoint not found.' });
  });

  // Vite dev middleware or static dist serving
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dr. Khaled Yasser Practice Server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
