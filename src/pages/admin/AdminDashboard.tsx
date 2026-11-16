import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  Calendar,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  Eye,
  Users,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { analyticsApi } from '../../api/analyticsApi';
import { appointmentApi } from '../../api/appointmentApi';
import { availabilityApi } from '../../api/availabilityApi';
import { patientApi, PatientSummary } from '../../api/patientApi';
import { AnalyticsOverview, Appointment, TimeSlot } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { DoctorAdminLayout } from '../../components/layout/PortalLayouts';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { AppointmentStatusBadge, Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Input';
import { ErrorState, SkeletonCard } from '../../components/ui/States';

function formatIsoOffset(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export function AdminDashboard() {
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [slotDate, setSlotDate] = useState<string>(() => formatIsoOffset(1));
  const [daySlots, setDaySlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [rejectTarget, setRejectTarget] = useState<Appointment | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, appts, pts] = await Promise.all([
        analyticsApi.getOverview(),
        appointmentApi.list(),
        patientApi.listAdminPatients(),
      ]);
      setAnalytics(ov);
      setAppointments(appts);
      setPatients(pts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setSlotsLoading(true);
    availabilityApi
      .getSlotsForDate(slotDate)
      .then(setDaySlots)
      .catch(() => setDaySlots([]))
      .finally(() => setSlotsLoading(false));
  }, [slotDate, appointments]);

  const handleAccept = async (apt: Appointment) => {
    setProcessingId(apt.id);
    try {
      const updated = await appointmentApi.updateStatus(apt.id, 'Accepted');
      setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      showToast('Appointment accepted', `${apt.patientName} (${apt.date} ${apt.time})`, 'success');
      analyticsApi.getOverview().then(setAnalytics).catch(() => {});
    } catch (err) {
      showToast('Action failed', err instanceof Error ? err.message : undefined, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTarget || !rejectReason.trim()) return;
    setProcessingId(rejectTarget.id);
    try {
      const updated = await appointmentApi.updateStatus(
        rejectTarget.id,
        'Rejected',
        rejectReason.trim()
      );
      setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setRejectTarget(null);
      setRejectReason('');
      showToast('Appointment declined', undefined, 'info');
      analyticsApi.getOverview().then(setAnalytics).catch(() => {});
    } catch (err) {
      showToast('Action failed', err instanceof Error ? err.message : undefined, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingList = appointments.filter((a) => a.status === 'Pending');
  const activeDayBookings = appointments.filter(
    (a) => a.date === slotDate && (a.status === 'Pending' || a.status === 'Accepted' || a.status === 'Completed')
  );
  const bookingByTime = new Map(activeDayBookings.map((a) => [a.time, a]));
  const availableCount = daySlots.filter((s) => s.available).length;
  const bookedCount = daySlots.filter((s) => !s.available && s.reason === 'Booked').length;
  const googleUsersCount = patients.filter((p) => p.authProvider === 'google').length;

  return (
    <DoctorAdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-mono font-semibold uppercase tracking-widest text-[#148F77] dark:text-[#27C2A4]">
              Al-Shifa Medical Clinic · Banha
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">{t.adminNav.dashboard}</h1>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link to="/doctor-admin/availability">
              <Button variant="secondary" size="sm">
                {t.adminNav.availability}
              </Button>
            </Link>
            <Link to="/doctor-admin/appointments">
              <Button size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                {t.adminNav.appointments}
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error || !analytics ? (
          <ErrorState description={error || undefined} onRetry={loadData} />
        ) : (
          <>
            {/* Primary KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                label={language === 'ar' ? 'طلبات بانتظار التأكيد' : 'Pending Requests'}
                value={analytics.summary.pendingRequests}
                sublabel={language === 'ar' ? 'بانتظار موافقة الطبيب' : 'Awaiting doctor confirmation'}
                icon={<Clock className="w-5 h-5" />}
                accent="gold"
              />
              <StatCard
                label={language === 'ar' ? 'المواعيد المؤكدة' : 'Accepted Appointments'}
                value={analytics.summary.acceptedAppointments}
                sublabel={`${analytics.summary.completedAppointments} ${language === 'ar' ? 'مكتمل' : 'completed total'}`}
                icon={<CalendarCheck className="w-5 h-5" />}
                accent="teal"
              />
              <StatCard
                label={language === 'ar' ? 'إيرادات الشهر' : 'Month Revenue'}
                value={`${analytics.summary.revenueMonth} EGP`}
                sublabel={`${language === 'ar' ? 'اليوم:' : 'Today:'} ${analytics.summary.revenueToday} EGP`}
                icon={<DollarSign className="w-5 h-5" />}
                accent="teal"
              />
              <StatCard
                label={language === 'ar' ? 'زوار الموقع' : 'Website Visitors'}
                value={analytics.summary.totalVisitors}
                sublabel={`${analytics.summary.uniqueVisitors} ${language === 'ar' ? 'زائر فريد' : 'unique'} · ${analytics.summary.totalPatients} ${language === 'ar' ? 'مريض مسجل' : 'patients'}`}
                icon={<Eye className="w-5 h-5" />}
                accent="neutral"
              />
            </div>

            {/* Booked vs Available Slots Board */}
            <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#148F77] dark:text-[#27C2A4]" />
                    <span>
                      {language === 'ar'
                        ? 'جدول المواعيد المحجوزة والمتاحة حسب اليوم'
                        : 'Daily Schedule: Booked vs Available Time Slots'}
                    </span>
                  </h2>
                  <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0] mt-1">
                    {language === 'ar'
                      ? 'استعرض الساعات الفارغة المتاحة للحجز والمواعيد المحجوزة مع بيانات المريض وحالة التأكيد.'
                      : 'Inspect open/free slots versus booked appointments and who reserved each time.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { label: language === 'ar' ? 'اليوم' : 'Today', offset: 0 },
                    { label: language === 'ar' ? 'غداً' : 'Tomorrow', offset: 1 },
                    { label: language === 'ar' ? 'بعد غد' : '+2 Days', offset: 2 },
                  ].map((preset) => {
                    const targetIso = formatIsoOffset(preset.offset);
                    const active = slotDate === targetIso;
                    return (
                      <button
                        key={preset.offset}
                        type="button"
                        onClick={() => setSlotDate(targetIso)}
                        className={`h-9 px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#148F77] text-white border-[#148F77]'
                            : 'border-black/10 dark:border-white/10 text-[#5B6470] dark:text-[#9DA5B0] hover:text-[#0F1419] dark:hover:text-[#F5F7FA]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                  <input
                    type="date"
                    value={slotDate}
                    onChange={(e) => setSlotDate(e.target.value)}
                    className="h-9 px-3 rounded-xl border border-black/12 dark:border-white/12 bg-[#F6F7F5] dark:bg-[#151B22] text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                <Badge variant="teal">
                  {language === 'ar' ? `متاح للحجز: ${availableCount}` : `Available / Free: ${availableCount}`}
                </Badge>
                <Badge variant="gold">
                  {language === 'ar' ? `محجوز: ${bookedCount}` : `Booked: ${bookedCount}`}
                </Badge>
                <Badge variant="neutral">
                  {language === 'ar' ? `إجمالي الفترات: ${daySlots.length}` : `Total Slots: ${daySlots.length}`}
                </Badge>
              </div>

              {slotsLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : daySlots.length === 0 ? (
                <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0] py-6 text-center rounded-xl border border-dashed border-black/10 dark:border-white/10">
                  {language === 'ar'
                    ? 'لا توجد ساعات عمل مجدولة أو اليوم محجوب في هذه التاريخ.'
                    : 'No clinic hours configured or day is closed/blocked on this date.'}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {daySlots.map((slot) => {
                    const bookedApt = bookingByTime.get(slot.time);
                    if (bookedApt) {
                      return (
                        <div
                          key={slot.time}
                          className="rounded-xl border border-[#C8A96B]/40 bg-[#C8A96B]/8 p-3.5 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs font-bold text-[#8E6F36] dark:text-[#E5C98B]">
                              {slot.time}
                            </span>
                            <AppointmentStatusBadge status={bookedApt.status} />
                          </div>
                          <div>
                            <p className="text-xs font-bold truncate">{bookedApt.patientName}</p>
                            <p className="text-[11px] text-[#5B6470] dark:text-[#9DA5B0] font-mono truncate">
                              {bookedApt.bookingCode} · {bookedApt.patientPhone || bookedApt.patientEmail}
                            </p>
                          </div>
                          {bookedApt.status === 'Pending' && (
                            <div className="flex gap-1.5 pt-1">
                              <Button
                                size="sm"
                                className="flex-1 h-7 text-[11px]"
                                isLoading={processingId === bookedApt.id}
                                onClick={() => handleAccept(bookedApt)}
                              >
                                {language === 'ar' ? 'تأكيد' : 'Confirm'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-[11px] text-red-500 border-red-500/25"
                                onClick={() => {
                                  setRejectTarget(bookedApt);
                                  setRejectReason('');
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={slot.time}
                        className={`rounded-xl border p-3.5 flex items-center justify-between gap-2 ${
                          slot.available
                            ? 'border-[#27C2A4]/30 bg-[#27C2A4]/6'
                            : 'border-black/8 dark:border-white/8 bg-[#F6F7F5]/60 dark:bg-[#151B22]/60 opacity-65'
                        }`}
                      >
                        <div>
                          <p className="font-mono text-xs font-bold">{slot.time}</p>
                          <p className="text-[11px] text-[#5B6470] dark:text-[#9DA5B0] mt-0.5">
                            {slot.available
                              ? language === 'ar'
                                ? 'موعد فاضي — متاح'
                                : 'Free / Open Slot'
                              : slot.reason || (language === 'ar' ? 'غير متاح' : 'Unavailable')}
                          </p>
                        </div>
                        {slot.available && (
                          <CheckCircle2 className="w-4 h-4 text-[#148F77] dark:text-[#27C2A4] shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Pending Approval Queue */}
              <div className="lg:col-span-5 rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold">
                    {language === 'ar' ? 'طلبات الحجز المعلقة' : 'Pending Appointment Requests'}
                  </h2>
                  <span className="text-xs font-mono font-semibold text-[#A58547] dark:text-[#C8A96B]">
                    {pendingList.length} pending
                  </span>
                </div>

                {pendingList.length === 0 ? (
                  <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0] py-8 text-center">
                    No pending booking requests at this moment.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pendingList.slice(0, 5).map((apt) => (
                      <div
                        key={apt.id}
                        className="rounded-xl border border-black/8 dark:border-white/8 bg-[#F6F7F5] dark:bg-[#151B22] p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold">{apt.patientName}</p>
                            <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0] font-mono">
                              {apt.date} · {apt.time} ·{' '}
                              {apt.consultationType === 'Online' ? 'Online' : 'Clinic'}
                            </p>
                          </div>
                          <AppointmentStatusBadge status={apt.status} />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            isLoading={processingId === apt.id}
                            leftIcon={<Check className="w-3.5 h-3.5" />}
                            onClick={() => handleAccept(apt)}
                          >
                            {language === 'ar' ? 'تأكيد الحجز' : 'Accept'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-red-500 border-red-500/25 hover:bg-red-500/10"
                            leftIcon={<X className="w-3.5 h-3.5" />}
                            onClick={() => {
                              setRejectTarget(apt);
                              setRejectReason('');
                            }}
                          >
                            {language === 'ar' ? 'رفض' : 'Reject'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Appointments & Visitors Chart */}
              <div className="lg:col-span-7 rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold">
                      {language === 'ar' ? 'تحليل الزيارات (آخر ١٤ يوماً)' : 'Website Traffic (14 Days)'}
                    </h2>
                    <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0]">
                      Daily page visits vs unique visitors
                    </p>
                  </div>
                  <Link
                    to="/doctor-admin/analytics"
                    className="text-xs font-semibold text-[#148F77] dark:text-[#27C2A4] hover:underline flex items-center gap-1"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    {language === 'ar' ? 'كل التحليلات' : 'Full Analytics'}
                  </Link>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.visitorsOverTime}>
                      <defs>
                        <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#27C2A4" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#27C2A4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="visitors"
                        stroke="#27C2A4"
                        strokeWidth={2}
                        fill="url(#tealGrad)"
                        name="Page Views"
                      />
                      <Area
                        type="monotone"
                        dataKey="uniqueVisitors"
                        stroke="#C8A96B"
                        strokeWidth={2}
                        fill="transparent"
                        name="Unique Visitors"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-black/6 dark:border-white/6 text-xs">
                  <div>
                    <p className="text-[#5B6470] dark:text-[#9DA5B0]">WhatsApp Clicks</p>
                    <p className="text-base font-bold font-mono mt-0.5">
                      {analytics.summary.whatsappClicks}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#5B6470] dark:text-[#9DA5B0]">Conversion Rate</p>
                    <p className="text-base font-bold font-mono mt-0.5 text-[#148F77] dark:text-[#27C2A4]">
                      {analytics.summary.conversionRate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[#5B6470] dark:text-[#9DA5B0] flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> Registered Patients
                    </p>
                    <p className="text-base font-bold font-mono mt-0.5">
                      {analytics.summary.registeredUsers}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Registered & Signed-In Users + Bookings by Day Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold">
                      {language === 'ar'
                        ? 'المرضى والحسابات المسجلة (Google / البريد)'
                        : 'Registered & Signed-In Patients'}
                    </h2>
                    <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0]">
                      {patients.length} accounts · {googleUsersCount} via Google Sign-In
                    </p>
                  </div>
                  <Link
                    to="/doctor-admin/patients"
                    className="text-xs font-semibold text-[#148F77] dark:text-[#27C2A4] hover:underline"
                  >
                    {language === 'ar' ? 'عرض كل المرضى' : 'View Directory'}
                  </Link>
                </div>

                <div className="divide-y divide-black/6 dark:divide-white/6">
                  {patients.slice(0, 6).map((p) => (
                    <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar src={p.avatarUrl} name={p.fullName} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate">{p.fullName}</p>
                          <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0] truncate">
                            {p.email} {p.phone ? `· ${p.phone}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={p.authProvider === 'google' ? 'gold' : 'neutral'}>
                          {p.authProvider === 'google' ? 'Google' : 'Email'}
                        </Badge>
                        <span className="text-xs font-mono text-[#5B6470] dark:text-[#9DA5B0]">
                          {p.appointmentCount} visits
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 space-y-4">
                <div>
                  <h2 className="text-base font-bold">
                    {language === 'ar' ? 'أكثر الأيام طلباً للحجز' : 'Booking Demand by Day'}
                  </h2>
                  <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0]">
                    Distribution of clinic & online appointments
                  </p>
                </div>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.mostRequestedDays}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#27C2A4" radius={[6, 6, 0, 0]} name="Bookings" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        title="Decline Appointment Request"
      >
        <form onSubmit={handleReject} className="space-y-4">
          <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0]">
            Provide a brief reason for declining <strong>{rejectTarget?.patientName}</strong>’s
            request ({rejectTarget?.date} at {rejectTarget?.time}). The patient will see this note.
          </p>
          <Textarea
            label="Rejection Reason"
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Time slot unavailable due to urgent hospital procedure. Please book the 6:00 PM slot."
            required
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setRejectTarget(null)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="danger" isLoading={Boolean(processingId)}>
              Confirm Reject
            </Button>
          </div>
        </form>
      </Modal>
    </DoctorAdminLayout>
  );
}
