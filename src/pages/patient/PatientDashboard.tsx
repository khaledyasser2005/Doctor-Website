import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  Clock,
  MessageCircle,
} from 'lucide-react';
import { appointmentApi } from '../../api/appointmentApi';
import { notificationApi } from '../../api/notificationApi';
import { doctorApi } from '../../api/doctorApi';
import { Appointment, DoctorProfile, NotificationItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { DOCTOR_PORTRAIT_URL } from '../../utils/constants';
import { buildGeneralWhatsAppUrl } from '../../utils/whatsapp';
import { PatientLayout } from '../../components/layout/PortalLayouts';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { AppointmentStatusBadge } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/States';

export function PatientHomePage() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      appointmentApi.list().catch(() => []),
      notificationApi.list().catch(() => []),
      doctorApi.getPublicPractice().then((b) => b.doctor).catch(() => null),
    ])
      .then(([appts, notifs, doc]) => {
        setAppointments(appts);
        setNotifications(notifs);
        setDoctor(doc);
      })
      .finally(() => setLoading(false));
  }, []);

  const upcoming = appointments.find((a) => a.status === 'Accepted' || a.status === 'Pending');
  const pendingCount = appointments.filter((a) => a.status === 'Pending').length;
  const acceptedCount = appointments.filter((a) => a.status === 'Accepted').length;
  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  return (
    <PatientLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-mono font-semibold uppercase tracking-widest text-[#148F77] dark:text-[#27C2A4]">
              {t.nav.portal}
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
              {language === 'ar' ? `مرحباً، ${user?.fullName}` : `Welcome, ${user?.fullName}`}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link to="/patient/book">
              <Button leftIcon={<CalendarPlus className="w-4 h-4" />}>
                {t.patientNav.book}
              </Button>
            </Link>
            <a href={buildGeneralWhatsAppUrl(language)} target="_blank" rel="noopener noreferrer">
              <Button variant="whatsapp" leftIcon={<MessageCircle className="w-4 h-4" />}>
                {t.whatsapp.chatCta}
              </Button>
            </a>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <StatCard
                label={t.status.Accepted}
                value={acceptedCount}
                icon={<CheckCircle2 className="w-5 h-5" />}
                accent="teal"
              />
              <StatCard
                label={t.status.Pending}
                value={pendingCount}
                icon={<Clock className="w-5 h-5" />}
                accent="gold"
              />
              <StatCard
                label={t.patientNav.notifications}
                value={unreadNotifs}
                icon={<Bell className="w-5 h-5" />}
                accent="neutral"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Next Appointment */}
              <div className="lg:col-span-7 rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold">
                    {language === 'ar' ? 'الموعد القادم' : 'Next Scheduled Request'}
                  </h2>
                  <Link
                    to="/patient/appointments"
                    className="text-xs font-semibold text-[#148F77] dark:text-[#27C2A4] hover:underline"
                  >
                    {t.common.all}
                  </Link>
                </div>

                {upcoming ? (
                  <div className="rounded-xl border border-black/8 dark:border-white/8 bg-[#F6F7F5] dark:bg-[#151B22] p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold text-[#148F77] dark:text-[#27C2A4]">
                        {upcoming.bookingCode}
                      </span>
                      <AppointmentStatusBadge status={upcoming.status} />
                    </div>
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#148F77] dark:text-[#27C2A4]" />
                        <span className="font-mono font-semibold">{upcoming.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#148F77] dark:text-[#27C2A4]" />
                        <span className="font-mono font-semibold">{upcoming.time}</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0]">
                      {upcoming.consultationType === 'Online'
                        ? t.booking.onlineConsult
                        : `${t.booking.clinicVisit} · ${upcoming.clinicAddress}`}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-black/12 dark:border-white/12 p-6 text-center space-y-3">
                    <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0]">
                      {language === 'ar'
                        ? 'لا توجد مواعيد قادمة حالياً.'
                        : 'You have no upcoming appointment requests.'}
                    </p>
                    <Link to="/patient/book">
                      <Button size="sm">{t.nav.bookAppointment}</Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Doctor Quick Card */}
              <div className="lg:col-span-5 rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={doctor?.portraitUrl || DOCTOR_PORTRAIT_URL}
                    alt={t.brandName}
                    className="w-16 h-16 rounded-2xl object-cover object-top border border-black/10 dark:border-white/10"
                  />
                  <div>
                    <h2 className="text-base font-bold">
                      {language === 'ar'
                        ? doctor?.clinicNameAr || 'عيادة الشفاء الطبية'
                        : doctor?.clinicName || 'Al-Shifa Medical Clinic'}
                    </h2>
                    <p className="text-xs text-[#148F77] dark:text-[#27C2A4] font-semibold">
                      {language === 'ar'
                        ? doctor?.clinicAddressAr || 'بنها، القليوبية، مصر'
                        : doctor?.clinicAddress || 'Banha, Qalyubia, Egypt'}
                    </p>
                    <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0] mt-1">
                      {language === 'ar'
                        ? doctor?.clinicHoursSummaryAr || ''
                        : doctor?.clinicHoursSummary || ''}
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t border-black/6 dark:border-white/6 flex gap-2">
                  <Link to="/patient/doctor" className="flex-1">
                    <Button variant="secondary" className="w-full" size="sm">
                      {t.hero.secondaryCta}
                    </Button>
                  </Link>
                  <a
                    href={buildGeneralWhatsAppUrl(language)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="whatsapp" className="w-full" size="sm">
                      WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </PatientLayout>
  );
}
