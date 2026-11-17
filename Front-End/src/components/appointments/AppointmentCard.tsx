import React from 'react';
import { Calendar, Clock, MapPin, MessageCircle, Video, AlertCircle } from 'lucide-react';
import { Appointment } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { AppointmentStatusBadge } from '../ui/Badge';
import { buildBookingWhatsAppUrl } from '../../utils/whatsapp';
import { analyticsApi } from '../../api/analyticsApi';

export function downloadCalendarIcs(appointment: Appointment) {
  const cleanDate = appointment.date.replace(/-/g, '');
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Al-Shifa Medical Clinic//Medical Appointment//EN',
    'BEGIN:VEVENT',
    `UID:${appointment.id}@alshifaclinic-banha.com`,
    `DTSTAMP:${cleanDate}T090000Z`,
    `DTSTART:${cleanDate}T120000`,
    `DTEND:${cleanDate}T123000`,
    `SUMMARY:Consultation at Al-Shifa Medical Clinic (${appointment.bookingCode})`,
    `LOCATION:${appointment.consultationType === 'Online' ? 'Online Consultation' : appointment.clinicAddress}`,
    `DESCRIPTION:Status: ${appointment.status} | Time: ${appointment.time}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `appointment-${appointment.bookingCode}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function AppointmentCard({
  appointment,
  onSelect,
  onCancel,
}: {
  appointment: Appointment;
  onSelect?: (apt: Appointment) => void;
  onCancel?: (apt: Appointment) => void;
}) {
  const { language, t } = useLanguage();
  const canCancel = appointment.status === 'Pending' || appointment.status === 'Accepted';
  const waUrl = buildBookingWhatsAppUrl(appointment, language);

  return (
    <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-mono font-semibold text-[#148F77] dark:text-[#27C2A4]">
              {appointment.bookingCode}
            </span>
            <AppointmentStatusBadge status={appointment.status} />
          </div>
          <h3 className="text-base font-bold text-[#0F1419] dark:text-[#F5F7FA] mt-1.5">
            {appointment.clinicName || (language === 'ar' ? 'عيادة الشفاء الطبية' : 'Al-Shifa Medical Clinic')}
          </h3>
        </div>
        <p className="text-sm font-bold tabular-nums text-[#0F1419] dark:text-[#F5F7FA]">
          {appointment.fee} EGP
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-[#5B6470] dark:text-[#9DA5B0]">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#148F77] dark:text-[#27C2A4] shrink-0" />
          <span className="font-mono">{appointment.date}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#148F77] dark:text-[#27C2A4] shrink-0" />
          <span className="font-mono">{appointment.time}</span>
        </div>
        <div className="flex items-center gap-2">
          {appointment.consultationType === 'Online' ? (
            <Video className="w-4 h-4 text-[#148F77] dark:text-[#27C2A4] shrink-0" />
          ) : (
            <MapPin className="w-4 h-4 text-[#148F77] dark:text-[#27C2A4] shrink-0" />
          )}
          <span>
            {appointment.consultationType === 'Online'
              ? t.booking.onlineConsult
              : t.booking.clinicVisit}
          </span>
        </div>
      </div>

      {appointment.status === 'Rejected' && appointment.rejectionReason && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/8 p-3 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{appointment.rejectionReason}</span>
        </div>
      )}

      <div className="pt-3 border-t border-black/6 dark:border-white/6 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => analyticsApi.track('whatsapp_click', '/patient/appointments')}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1FAF5A]/12 text-[#168F47] dark:text-[#4ADE80] text-xs font-semibold hover:bg-[#1FAF5A]/20 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{t.whatsapp.sendBookingCta}</span>
          </a>
          <button
            type="button"
            onClick={() => downloadCalendarIcs(appointment)}
            className="h-8 px-3 rounded-lg border border-black/10 dark:border-white/10 text-xs font-semibold text-[#5B6470] dark:text-[#9DA5B0] hover:text-[#0F1419] dark:hover:text-[#F5F7FA] cursor-pointer"
          >
            {t.booking.addToCalendar}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onSelect && (
            <button
              type="button"
              onClick={() => onSelect(appointment)}
              className="h-8 px-3 rounded-lg text-xs font-semibold text-[#148F77] dark:text-[#27C2A4] hover:bg-[#148F77]/10 cursor-pointer"
            >
              {t.common.viewDetails}
            </button>
          )}
          {canCancel && onCancel && (
            <button
              type="button"
              onClick={() => onCancel(appointment)}
              className="h-8 px-3 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 cursor-pointer"
            >
              {t.common.cancel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
