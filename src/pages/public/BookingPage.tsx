import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  MessageCircle,
  Video,
} from 'lucide-react';
import { doctorApi } from '../../api/doctorApi';
import { availabilityApi } from '../../api/availabilityApi';
import { appointmentApi } from '../../api/appointmentApi';
import { analyticsApi } from '../../api/analyticsApi';
import { Appointment, ConsultationType, DoctorProfile, TimeSlot } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { buildBookingWhatsAppUrl } from '../../utils/whatsapp';
import { DOCTOR_PORTRAIT_URL } from '../../utils/constants';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { Footer } from '../../components/layout/Footer';
import { FloatingWhatsAppButton } from '../../components/layout/FloatingWhatsAppButton';
import { DateCalendar } from '../../components/ui/Calendar';
import { TimeSlotGrid } from '../../components/ui/TimeSlot';
import { Input, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AppointmentStatusBadge } from '../../components/ui/Badge';
import { downloadCalendarIcs } from '../../components/appointments/AppointmentCard';

function getTomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export function BookingFlow({ insidePortal = false }: { insidePortal?: boolean }) {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [consultationType, setConsultationType] = useState<ConsultationType>('ClinicVisit');
  const [selectedDate, setSelectedDate] = useState<string>(getTomorrowIso());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>('');

  const [patientName, setPatientName] = useState(user?.fullName || '');
  const [patientEmail, setPatientEmail] = useState(user?.email || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    doctorApi.getPublicPractice().then((b) => setDoctor(b.doctor)).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      if (!patientName) setPatientName(user.fullName);
      if (!patientEmail) setPatientEmail(user.email);
      if (!patientPhone && user.phone) setPatientPhone(user.phone);
    }
  }, [user, patientName, patientEmail, patientPhone]);

  const fetchSlots = async (date: string) => {
    setSlotsLoading(true);
    setSelectedTime('');
    try {
      const data = await availabilityApi.getSlotsForDate(date);
      setSlots(data);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      showToast('Please select a date and time slot first.', undefined, 'warning');
      return;
    }
    if (!patientName.trim() || !patientEmail.trim() || !patientPhone.trim()) {
      showToast('Please fill in your name, email, and phone number.', undefined, 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const created = await appointmentApi.create({
        patientName: patientName.trim(),
        patientEmail: patientEmail.trim(),
        patientPhone: patientPhone.trim(),
        date: selectedDate,
        time: selectedTime,
        consultationType,
        notes: notes.trim() || undefined,
      });
      setConfirmedAppointment(created);
      showToast(t.booking.sentTitle, undefined, 'success');
    } catch (err) {
      showToast(
        'Could not complete booking',
        err instanceof Error ? err.message : undefined,
        'error'
      );
      await fetchSlots(selectedDate);
    } finally {
      setSubmitting(false);
    }
  };

  const fee = doctor
    ? consultationType === 'Online'
      ? doctor.consultationFeeOnline
      : doctor.consultationFeeClinic
    : consultationType === 'Online'
    ? 400
    : 500;

  if (confirmedAppointment) {
    const waUrl = buildBookingWhatsAppUrl(confirmedAppointment, language);
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#10141A] p-8 sm:p-10 space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#148F77]/12 dark:bg-[#27C2A4]/15 text-[#0F766E] dark:text-[#27C2A4] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-center">
              <AppointmentStatusBadge status={confirmedAppointment.status} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">{t.booking.sentTitle}</h1>
            <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0] leading-relaxed max-w-lg mx-auto">
              {t.booking.sentMessage}
            </p>
          </div>

          <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-[#F6F7F5] dark:bg-[#151B22] p-5 text-start grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0]">{t.booking.bookingIdLabel}</p>
              <p className="font-mono font-bold text-[#148F77] dark:text-[#27C2A4]">
                {confirmedAppointment.bookingCode}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0]">{t.common.type}</p>
              <p className="font-semibold">
                {confirmedAppointment.consultationType === 'Online'
                  ? t.booking.onlineConsult
                  : t.booking.clinicVisit}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0]">{t.common.date}</p>
              <p className="font-mono font-semibold">{confirmedAppointment.date}</p>
            </div>
            <div>
              <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0]">{t.common.time}</p>
              <p className="font-mono font-semibold">{confirmedAppointment.time}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => analyticsApi.track('whatsapp_click', '/book/confirmation')}
              className="w-full sm:w-auto"
            >
              <Button
                variant="whatsapp"
                className="w-full"
                leftIcon={<MessageCircle className="w-4 h-4" />}
              >
                {t.whatsapp.sendBookingCta}
              </Button>
            </a>
            <Link to={user ? '/patient/appointments' : '/login'} className="w-full sm:w-auto">
              <Button className="w-full" leftIcon={<CalendarCheck className="w-4 h-4" />}>
                {t.booking.viewMyAppointments}
              </Button>
            </Link>
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => downloadCalendarIcs(confirmedAppointment)}
            >
              {t.booking.addToCalendar}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${insidePortal ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 py-10'} space-y-8`}>
      <div>
        <p className="text-xs font-mono font-semibold uppercase tracking-[0.18em] text-[#148F77] dark:text-[#27C2A4]">
          {t.brandName}
        </p>
        <h1 className="text-3xl font-extrabold mt-1">{t.booking.title}</h1>
        <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0] mt-1">{t.booking.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Steps 1 - 4 */}
        <div className="lg:col-span-8 space-y-8">
          {/* Step 1: Consultation Type */}
          <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#148F77] dark:bg-[#27C2A4] text-white dark:text-[#080A0D] text-xs font-mono font-bold flex items-center justify-center">
                1
              </span>
              {t.booking.step1}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setConsultationType('ClinicVisit')}
                className={`text-start rounded-2xl border p-5 transition-all cursor-pointer space-y-2 ${
                  consultationType === 'ClinicVisit'
                    ? 'border-[#148F77] dark:border-[#27C2A4] bg-[#148F77]/6 dark:bg-[#27C2A4]/10'
                    : 'border-black/10 dark:border-white/10 hover:border-black/25 dark:hover:border-white/25'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Building2 className="w-5 h-5 text-[#148F77] dark:text-[#27C2A4]" />
                  <span className="text-sm font-mono font-bold">
                    {doctor?.consultationFeeClinic ?? 500} {doctor?.currency ?? 'EGP'}
                  </span>
                </div>
                <p className="text-sm font-bold">{t.booking.clinicVisit}</p>
                <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0]">{t.booking.clinicVisitDesc}</p>
              </button>

              <button
                type="button"
                onClick={() => setConsultationType('Online')}
                className={`text-start rounded-2xl border p-5 transition-all cursor-pointer space-y-2 ${
                  consultationType === 'Online'
                    ? 'border-[#148F77] dark:border-[#27C2A4] bg-[#148F77]/6 dark:bg-[#27C2A4]/10'
                    : 'border-black/10 dark:border-white/10 hover:border-black/25 dark:hover:border-white/25'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Video className="w-5 h-5 text-[#148F77] dark:text-[#27C2A4]" />
                  <span className="text-sm font-mono font-bold">
                    {doctor?.consultationFeeOnline ?? 400} {doctor?.currency ?? 'EGP'}
                  </span>
                </div>
                <p className="text-sm font-bold">{t.booking.onlineConsult}</p>
                <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0]">{t.booking.onlineConsultDesc}</p>
              </button>
            </div>
          </div>

          {/* Step 2 & 3: Date & Slots */}
          <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 space-y-6">
            <h2 className="text-base font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#148F77] dark:bg-[#27C2A4] text-white dark:text-[#080A0D] text-xs font-mono font-bold flex items-center justify-center">
                2
              </span>
              {t.booking.selectDateLabel} & {t.booking.selectTimeLabel}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DateCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#5B6470] dark:text-[#9DA5B0]">
                  {t.booking.selectTimeLabel} ({selectedDate})
                </p>
                {slotsLoading ? (
                  <div className="grid grid-cols-2 gap-2.5">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="h-11 rounded-xl bg-black/5 dark:bg-white/5 animate-pulse"
                      />
                    ))}
                  </div>
                ) : (
                  <TimeSlotGrid
                    slots={slots}
                    selectedTime={selectedTime}
                    onSelectTime={setSelectedTime}
                    emptyMessage={t.booking.noSlotsDay}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Step 4: Patient Info */}
          <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 space-y-5">
            <h2 className="text-base font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#148F77] dark:bg-[#27C2A4] text-white dark:text-[#080A0D] text-xs font-mono font-bold flex items-center justify-center">
                3
              </span>
              {t.booking.patientInfoTitle}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t.booking.fullName}
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
              />
              <Input
                label={t.booking.phone}
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="+20 1X XXXX XXXX"
                required
              />
            </div>
            <Input
              label={t.booking.email}
              type="email"
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
              required
            />
            <Textarea
              label={t.booking.notes}
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.booking.notesPlaceholder}
            />
          </div>
        </div>

        {/* Sticky Appointment Summary */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#10141A] p-6 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-black/6 dark:border-white/6">
              <img
                src={doctor?.portraitUrl || DOCTOR_PORTRAIT_URL}
                alt={language === 'ar' ? doctor?.clinicNameAr || 'عيادة الشفاء الطبية' : doctor?.clinicName || 'Al-Shifa Medical Clinic'}
                className="w-12 h-12 rounded-xl object-cover object-top"
              />
              <div>
                <p className="text-sm font-bold">
                  {language === 'ar'
                    ? doctor?.clinicNameAr || 'عيادة الشفاء الطبية'
                    : doctor?.clinicName || 'Al-Shifa Medical Clinic'}
                </p>
                <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0]">
                  {language === 'ar' ? doctor?.clinicAddressAr || 'بنها، القليوبية، مصر' : doctor?.clinicAddress || 'Banha, Qalyubia, Egypt'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#5B6470] dark:text-[#9DA5B0]">
                {t.booking.summaryTitle}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[#5B6470] dark:text-[#9DA5B0]">{t.common.type}</span>
                <span className="font-semibold">
                  {consultationType === 'Online' ? t.booking.onlineConsult : t.booking.clinicVisit}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5B6470] dark:text-[#9DA5B0] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {t.common.date}
                </span>
                <span className="font-mono font-semibold">{selectedDate || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5B6470] dark:text-[#9DA5B0] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {t.common.time}
                </span>
                <span className="font-mono font-semibold text-[#148F77] dark:text-[#27C2A4]">
                  {selectedTime || '—'}
                </span>
              </div>
              <div className="pt-3 border-t border-black/6 dark:border-white/6 flex items-center justify-between">
                <span className="font-semibold">{t.booking.feeLabel}</span>
                <span className="text-lg font-extrabold font-mono">
                  {fee} {doctor?.currency || 'EGP'}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              isLoading={submitting}
              disabled={!selectedDate || !selectedTime}
            >
              {t.booking.submitRequest}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export function BookingPage() {
  return (
    <div className="min-h-screen bg-transparent text-[#0F1419] dark:text-[#F5F7FA]">
      <PublicNavbar />
      <BookingFlow />
      <Footer />
      <FloatingWhatsAppButton />
    </div>
  );
}
