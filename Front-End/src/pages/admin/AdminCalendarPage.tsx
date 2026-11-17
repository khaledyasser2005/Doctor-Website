import React, { useEffect, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, MessageCircle } from 'lucide-react';
import { appointmentApi } from '../../api/appointmentApi';
import { availabilityApi } from '../../api/availabilityApi';
import { Appointment, TimeSlot } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { buildPatientContactWhatsAppUrl } from '../../utils/whatsapp';
import { DoctorAdminLayout } from '../../components/layout/PortalLayouts';
import { Tabs } from '../../components/ui/Card';
import { AppointmentStatusBadge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';

function formatIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export function AdminCalendarPage() {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [daySlots, setDaySlots] = useState<TimeSlot[]>([]);
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [anchorDate, setAnchorDate] = useState<Date>(new Date());
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);

  useEffect(() => {
    appointmentApi.list().then(setAppointments).catch(() => {});
  }, []);

  const anchorIso = formatIso(anchorDate);

  useEffect(() => {
    availabilityApi
      .getSlotsForDate(anchorIso)
      .then(setDaySlots)
      .catch(() => setDaySlots([]));
  }, [anchorIso, appointments]);

  const shiftRange = (dir: -1 | 1) => {
    const next = new Date(anchorDate);
    if (view === 'day') next.setDate(next.getDate() + dir);
    else if (view === 'week') next.setDate(next.getDate() + dir * 7);
    else next.setMonth(next.getMonth() + dir);
    setAnchorDate(next);
  };

  const quickStatus = async (apt: Appointment, status: 'Accepted' | 'Completed' | 'Cancelled') => {
    try {
      const updated = await appointmentApi.updateStatus(apt.id, status);
      setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setSelectedApt(updated);
      showToast(`Appointment marked ${status}`, undefined, 'success');
    } catch (err) {
      showToast('Update failed', err instanceof Error ? err.message : undefined, 'error');
    }
  };

  // Build visible dates
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(anchorDate);
    d.setDate(anchorDate.getDate() - anchorDate.getDay() + i);
    return d;
  });

  const year = anchorDate.getFullYear();
  const month = anchorDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthDates = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));

  return (
    <DoctorAdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold">{t.adminNav.calendar}</h1>
            <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0] mt-1">
              Day, Week, and Month schedule overview across all appointments.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Tabs
              tabs={[
                { id: 'day', label: 'Day' },
                { id: 'week', label: 'Week' },
                { id: 'month', label: 'Month' },
              ]}
              activeTab={view}
              onChange={(id) => setView(id as 'day' | 'week' | 'month')}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] px-5 py-3.5">
          <button
            type="button"
            onClick={() => shiftRange(-1)}
            className="w-9 h-9 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5"
          >
            <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
          </button>
          <span className="text-sm font-bold">
            {anchorDate.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
              ...(view === 'day' ? { day: 'numeric', weekday: 'long' } : {}),
            })}
          </span>
          <button
            type="button"
            onClick={() => shiftRange(1)}
            className="w-9 h-9 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5"
          >
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>

        {view === 'day' && (
          <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold font-mono">{anchorIso}</h2>
              <div className="flex items-center gap-3 text-xs">
                <span className="font-semibold text-[#148F77] dark:text-[#27C2A4]">
                  Open: {daySlots.filter((s) => s.available).length}
                </span>
                <span className="font-semibold text-[#C8A96B]">
                  Booked: {appointments.filter((a) => a.date === anchorIso && (a.status === 'Pending' || a.status === 'Accepted')).length}
                </span>
              </div>
            </div>

            {daySlots.length === 0 && appointments.filter((a) => a.date === anchorIso).length === 0 ? (
              <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0] py-6 text-center">
                No shifts or appointments scheduled for this day.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {daySlots.map((slot) => {
                  const apt = appointments.find(
                    (a) =>
                      a.date === anchorIso &&
                      a.time === slot.time &&
                      (a.status === 'Pending' || a.status === 'Accepted' || a.status === 'Completed')
                  );
                  if (apt) {
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => setSelectedApt(apt)}
                        className="w-full text-start rounded-xl border border-[#C8A96B]/40 bg-[#C8A96B]/8 p-4 flex items-center justify-between gap-3 hover:border-[#27C2A4] cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Clock className="w-4 h-4 text-[#C8A96B] shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate">{apt.patientName}</p>
                            <p className="text-xs font-mono text-[#5B6470] dark:text-[#9DA5B0]">
                              {apt.time} · {apt.consultationType}
                            </p>
                          </div>
                        </div>
                        <AppointmentStatusBadge status={apt.status} />
                      </button>
                    );
                  }
                  return (
                    <div
                      key={slot.time}
                      className={`rounded-xl border p-4 flex items-center justify-between gap-3 ${
                        slot.available
                          ? 'border-[#27C2A4]/30 bg-[#27C2A4]/6'
                          : 'border-black/8 dark:border-white/8 bg-[#F6F7F5]/60 dark:bg-[#151B22]/60 opacity-65'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-mono font-bold">{slot.time}</p>
                        <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0]">
                          {slot.available ? 'Free / Available' : slot.reason || 'Unavailable'}
                        </p>
                      </div>
                      {slot.available && (
                        <CheckCircle2 className="w-4 h-4 text-[#148F77] dark:text-[#27C2A4]" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {view === 'week' && (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDays.map((d) => {
              const iso = formatIso(d);
              const dayApts = appointments.filter((a) => a.date === iso);
              return (
                <div
                  key={iso}
                  className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-3.5 space-y-2.5 min-h-[220px]"
                >
                  <div className="pb-2 border-b border-black/6 dark:border-white/6">
                    <p className="text-[11px] uppercase font-semibold text-[#5B6470] dark:text-[#9DA5B0]">
                      {d.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className="text-sm font-bold font-mono">{d.getDate()}</p>
                  </div>
                  <div className="space-y-2">
                    {dayApts.map((apt) => (
                      <button
                        key={apt.id}
                        type="button"
                        onClick={() => setSelectedApt(apt)}
                        className="w-full text-start rounded-xl border border-black/8 dark:border-white/8 bg-[#F6F7F5] dark:bg-[#151B22] p-2.5 space-y-1 hover:border-[#27C2A4] cursor-pointer"
                      >
                        <p className="text-xs font-mono font-semibold text-[#148F77] dark:text-[#27C2A4]">
                          {apt.time}
                        </p>
                        <p className="text-xs font-bold truncate">{apt.patientName}</p>
                        <AppointmentStatusBadge status={apt.status} />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === 'month' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {monthDates.map((d) => {
              const iso = formatIso(d);
              const dayApts = appointments.filter((a) => a.date === iso);
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => {
                    setAnchorDate(d);
                    setView('day');
                  }}
                  className="text-start rounded-xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-3 min-h-[96px] flex flex-col justify-between hover:border-[#27C2A4] cursor-pointer"
                >
                  <span className="text-xs font-mono font-bold">{d.getDate()}</span>
                  {dayApts.length > 0 && (
                    <span className="text-[11px] font-semibold text-[#148F77] dark:text-[#27C2A4]">
                      {dayApts.length} appt{dayApts.length > 1 ? 's' : ''}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Drawer
        isOpen={Boolean(selectedApt)}
        onClose={() => setSelectedApt(null)}
        title={selectedApt ? `${selectedApt.bookingCode} · ${selectedApt.patientName}` : ''}
      >
        {selectedApt && (
          <div className="space-y-4 text-sm">
            <AppointmentStatusBadge status={selectedApt.status} />
            <p className="font-mono">
              {selectedApt.date} at {selectedApt.time} ({selectedApt.consultationType})
            </p>
            <p className="text-[#5B6470] dark:text-[#9DA5B0]">{selectedApt.patientPhone}</p>
            <div className="flex flex-col gap-2 pt-2">
              {selectedApt.status === 'Pending' && (
                <Button onClick={() => quickStatus(selectedApt, 'Accepted')}>
                  Accept Appointment
                </Button>
              )}
              {selectedApt.status === 'Accepted' && (
                <Button onClick={() => quickStatus(selectedApt, 'Completed')}>
                  Mark Completed
                </Button>
              )}
              <a
                href={buildPatientContactWhatsAppUrl(
                  selectedApt.patientPhone,
                  selectedApt.patientName
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="whatsapp"
                  className="w-full"
                  leftIcon={<MessageCircle className="w-4 h-4" />}
                >
                  Contact via WhatsApp
                </Button>
              </a>
            </div>
          </div>
        )}
      </Drawer>
    </DoctorAdminLayout>
  );
}
