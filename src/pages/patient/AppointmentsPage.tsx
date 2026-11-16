import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CalendarPlus, MessageCircle } from 'lucide-react';
import { appointmentApi } from '../../api/appointmentApi';
import { Appointment, AppointmentStatus } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { buildBookingWhatsAppUrl } from '../../utils/whatsapp';
import { PatientLayout } from '../../components/layout/PortalLayouts';
import { Tabs } from '../../components/ui/Card';
import { AppointmentCard, downloadCalendarIcs } from '../../components/appointments/AppointmentCard';
import { Drawer } from '../../components/ui/Drawer';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { AppointmentStatusBadge } from '../../components/ui/Badge';
import { EmptyState, ErrorState, SkeletonCard } from '../../components/ui/States';

export function PatientAppointmentsPage() {
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'All' | AppointmentStatus>('All');

  const [selected, setSelected] = useState<Appointment | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await appointmentApi.list();
      setAppointments(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const updated = await appointmentApi.updateStatus(cancelTarget.id, 'Cancelled');
      setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      if (selected?.id === updated.id) setSelected(updated);
      setCancelTarget(null);
      showToast('Appointment cancelled', undefined, 'info');
    } catch (err) {
      showToast(
        'Cancellation failed',
        err instanceof Error ? err.message : undefined,
        'error'
      );
    } finally {
      setCancelling(false);
    }
  };

  const filtered =
    activeTab === 'All'
      ? appointments
      : appointments.filter((a) => a.status === activeTab);

  const tabs = [
    { id: 'All', label: t.common.all, count: appointments.length },
    { id: 'Pending', label: t.status.Pending, count: appointments.filter((a) => a.status === 'Pending').length },
    { id: 'Accepted', label: t.status.Accepted, count: appointments.filter((a) => a.status === 'Accepted').length },
    { id: 'Completed', label: t.status.Completed, count: appointments.filter((a) => a.status === 'Completed').length },
    { id: 'Rejected', label: t.status.Rejected, count: appointments.filter((a) => a.status === 'Rejected').length },
    { id: 'Cancelled', label: t.status.Cancelled, count: appointments.filter((a) => a.status === 'Cancelled').length },
  ];

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold">{t.patientNav.appointments}</h1>
            <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0] mt-1">
              Track confirmation status, clinic details, or send booking updates on WhatsApp.
            </p>
          </div>
          <Link to="/patient/book">
            <Button leftIcon={<CalendarPlus className="w-4 h-4" />}>{t.patientNav.book}</Button>
          </Link>
        </div>

        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as 'All' | AppointmentStatus)}
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <ErrorState description={error} onRetry={load} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-5 h-5" />}
            title="No appointments in this view"
            description="Submit a new consultation request to schedule your visit at Al-Shifa Medical Clinic (Banha)."
            action={
              <Link to="/patient/book">
                <Button size="sm">{t.nav.bookAppointment}</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                onSelect={setSelected}
                onCancel={setCancelTarget}
              />
            ))}
          </div>
        )}
      </div>

      {/* Appointment Detail Drawer */}
      <Drawer
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.bookingCode} · ${t.common.viewDetails}` : ''}
      >
        {selected && (
          <div className="space-y-6 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-[#148F77] dark:text-[#27C2A4]">
                {selected.bookingCode}
              </span>
              <AppointmentStatusBadge status={selected.status} />
            </div>

            <div className="rounded-xl border border-black/8 dark:border-white/8 bg-[#F6F7F5] dark:bg-[#151B22] p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-[#5B6470] dark:text-[#9DA5B0]">{t.common.date}</span>
                <span className="font-mono font-semibold">{selected.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B6470] dark:text-[#9DA5B0]">{t.common.time}</span>
                <span className="font-mono font-semibold">{selected.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B6470] dark:text-[#9DA5B0]">{t.common.type}</span>
                <span className="font-semibold">
                  {selected.consultationType === 'Online'
                    ? t.booking.onlineConsult
                    : t.booking.clinicVisit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B6470] dark:text-[#9DA5B0]">{t.booking.feeLabel}</span>
                <span className="font-mono font-bold">{selected.fee} EGP</span>
              </div>
            </div>

            {selected.notes && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#5B6470] dark:text-[#9DA5B0] mb-1">
                  Notes
                </p>
                <p className="text-sm leading-relaxed">{selected.notes}</p>
              </div>
            )}

            {selected.status === 'Rejected' && selected.rejectionReason && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/8 p-4 text-xs text-red-700 dark:text-red-300">
                <p className="font-bold mb-1">Rejection Reason</p>
                <p>{selected.rejectionReason}</p>
              </div>
            )}

            <div className="flex flex-col gap-2.5 pt-2">
              <a
                href={buildBookingWhatsAppUrl(selected, language)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="whatsapp"
                  className="w-full"
                  leftIcon={<MessageCircle className="w-4 h-4" />}
                >
                  {t.whatsapp.sendBookingCta}
                </Button>
              </a>
              <Button variant="secondary" onClick={() => downloadCalendarIcs(selected)}>
                {t.booking.addToCalendar}
              </Button>
              {(selected.status === 'Pending' || selected.status === 'Accepted') && (
                <Button variant="danger" onClick={() => setCancelTarget(selected)}>
                  Cancel Appointment
                </Button>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Confirm Cancellation Modal */}
      <Modal
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        title="Cancel Appointment?"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0]">
            Are you sure you want to cancel appointment{' '}
            <strong className="text-[#0F1419] dark:text-[#F5F7FA]">
              {cancelTarget?.bookingCode}
            </strong>{' '}
            scheduled for {cancelTarget?.date} at {cancelTarget?.time}?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCancelTarget(null)}>
              Keep Appointment
            </Button>
            <Button variant="danger" isLoading={cancelling} onClick={handleConfirmCancel}>
              Confirm Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </PatientLayout>
  );
}
