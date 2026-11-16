import React, { useEffect, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Download,
  MessageCircle,
  Search,
  X,
} from 'lucide-react';
import { appointmentApi } from '../../api/appointmentApi';
import { Appointment, AppointmentStatus } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { buildPatientContactWhatsAppUrl } from '../../utils/whatsapp';
import { DoctorAdminLayout } from '../../components/layout/PortalLayouts';
import { Tabs } from '../../components/ui/Card';
import { Input, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AppointmentStatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Drawer } from '../../components/ui/Drawer';
import { EmptyState, ErrorState, SkeletonCard } from '../../components/ui/States';

export function AdminAppointmentsPage() {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'All' | AppointmentStatus>('All');
  const [query, setQuery] = useState('');

  const [detailTarget, setDetailTarget] = useState<Appointment | null>(null);
  const [acceptTarget, setAcceptTarget] = useState<Appointment | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Appointment | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setAppointments(await appointmentApi.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: AppointmentStatus, reason?: string) => {
    setSubmitting(true);
    try {
      const updated = await appointmentApi.updateStatus(id, status, reason);
      setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      if (detailTarget?.id === updated.id) setDetailTarget(updated);
      showToast(`Status updated to ${status}`, undefined, 'success');
      setAcceptTarget(null);
      setRejectTarget(null);
      setRejectReason('');
    } catch (err) {
      showToast('Update failed', err instanceof Error ? err.message : undefined, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = appointments.filter((a) => {
    const matchesTab = tab === 'All' || a.status === tab;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      a.patientName.toLowerCase().includes(q) ||
      a.patientEmail.toLowerCase().includes(q) ||
      a.bookingCode.toLowerCase().includes(q) ||
      a.patientPhone.toLowerCase().includes(q);
    return matchesTab && matchesQuery;
  });

  const exportCsv = () => {
    const header = ['Booking ID', 'Patient', 'Email', 'Phone', 'Date', 'Time', 'Type', 'Status', 'Fee'];
    const rows = filtered.map((a) => [
      a.bookingCode,
      a.patientName,
      a.patientEmail,
      a.patientPhone,
      a.date,
      a.time,
      a.consultationType,
      a.status,
      String(a.fee),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `appointments-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'All', label: t.common.all, count: appointments.length },
    { id: 'Pending', label: t.status.Pending, count: appointments.filter((a) => a.status === 'Pending').length },
    { id: 'Accepted', label: t.status.Accepted, count: appointments.filter((a) => a.status === 'Accepted').length },
    { id: 'Completed', label: t.status.Completed, count: appointments.filter((a) => a.status === 'Completed').length },
    { id: 'Rejected', label: t.status.Rejected, count: appointments.filter((a) => a.status === 'Rejected').length },
    { id: 'Cancelled', label: t.status.Cancelled, count: appointments.filter((a) => a.status === 'Cancelled').length },
  ];

  return (
    <DoctorAdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold">{t.adminNav.appointments}</h1>
            <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0] mt-1">
              Review requests, confirm slots, reject with notes, or contact patients via WhatsApp.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={exportCsv}
          >
            Export CSV
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <Tabs tabs={tabs} activeTab={tab} onChange={(id) => setTab(id as 'All' | AppointmentStatus)} />
          <div className="w-full lg:w-72">
            <Input
              placeholder="Search patient, code, phone..."
              leftIcon={<Search className="w-4 h-4" />}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <ErrorState description={error} onRetry={load} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No matching appointments"
            description="Try adjusting your status filter or search query."
          />
        ) : (
          <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead className="border-b border-black/8 dark:border-white/8 bg-[#F6F7F5] dark:bg-[#151B22] text-xs uppercase text-[#5B6470] dark:text-[#9DA5B0]">
                  <tr>
                    <th className="py-3.5 px-4 text-start">Code</th>
                    <th className="py-3.5 px-4 text-start">Patient</th>
                    <th className="py-3.5 px-4 text-start">Schedule</th>
                    <th className="py-3.5 px-4 text-start">Type</th>
                    <th className="py-3.5 px-4 text-start">Status</th>
                    <th className="py-3.5 px-4 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/6 dark:divide-white/6">
                  {filtered.map((apt) => (
                    <tr
                      key={apt.id}
                      className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-[#148F77] dark:text-[#27C2A4]">
                        {apt.bookingCode}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold">{apt.patientName}</p>
                        <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0]">{apt.patientPhone}</p>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">
                        <p className="font-semibold">{apt.date}</p>
                        <p className="text-[#5B6470] dark:text-[#9DA5B0]">{apt.time}</p>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        {apt.consultationType === 'Online' ? 'Online' : 'Clinic Visit'}
                      </td>
                      <td className="py-3.5 px-4">
                        <AppointmentStatusBadge status={apt.status} />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {apt.status === 'Pending' && (
                            <>
                              <Button
                                size="sm"
                                leftIcon={<Check className="w-3.5 h-3.5" />}
                                onClick={() => setAcceptTarget(apt)}
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-500 border-red-500/25"
                                leftIcon={<X className="w-3.5 h-3.5" />}
                                onClick={() => {
                                  setRejectTarget(apt);
                                  setRejectReason('');
                                }}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {apt.status === 'Accepted' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                              onClick={() => updateStatus(apt.id, 'Completed')}
                            >
                              Complete
                            </Button>
                          )}
                          <a
                            href={buildPatientContactWhatsAppUrl(apt.patientPhone, apt.patientName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-9 w-9 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center text-[#1FAF5A] hover:bg-[#1FAF5A]/10"
                            title="Contact Patient on WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                          <Button size="sm" variant="ghost" onClick={() => setDetailTarget(apt)}>
                            Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <Drawer
        isOpen={Boolean(detailTarget)}
        onClose={() => setDetailTarget(null)}
        title={detailTarget ? `${detailTarget.bookingCode} · ${detailTarget.patientName}` : ''}
      >
        {detailTarget && (
          <div className="space-y-5 text-sm">
            <AppointmentStatusBadge status={detailTarget.status} />
            <div className="rounded-xl border border-black/8 dark:border-white/8 bg-[#F6F7F5] dark:bg-[#151B22] p-4 space-y-2.5">
              <p>
                <strong>Patient:</strong> {detailTarget.patientName}
              </p>
              <p>
                <strong>Email:</strong> {detailTarget.patientEmail}
              </p>
              <p>
                <strong>Phone:</strong> {detailTarget.patientPhone}
              </p>
              <p>
                <strong>Date & Time:</strong> {detailTarget.date} · {detailTarget.time}
              </p>
              <p>
                <strong>Format:</strong>{' '}
                {detailTarget.consultationType === 'Online' ? 'Online Consultation' : 'Clinic Visit'}
              </p>
              <p>
                <strong>Fee:</strong> {detailTarget.fee} EGP
              </p>
            </div>

            {detailTarget.notes && (
              <div>
                <p className="text-xs font-semibold uppercase text-[#5B6470] dark:text-[#9DA5B0] mb-1">
                  Patient Notes
                </p>
                <p>{detailTarget.notes}</p>
              </div>
            )}

            {detailTarget.rejectionReason && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/8 p-3 text-xs text-red-400">
                <strong>Rejection Reason:</strong> {detailTarget.rejectionReason}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-3">
              {detailTarget.status === 'Pending' && (
                <>
                  <Button onClick={() => updateStatus(detailTarget.id, 'Accepted')}>
                    Accept Appointment
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setRejectTarget(detailTarget);
                      setRejectReason('');
                    }}
                  >
                    Reject with Reason
                  </Button>
                </>
              )}
              {detailTarget.status === 'Accepted' && (
                <>
                  <Button onClick={() => updateStatus(detailTarget.id, 'Completed')}>
                    Mark Completed
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => updateStatus(detailTarget.id, 'Cancelled')}
                  >
                    Cancel Appointment
                  </Button>
                </>
              )}
              <a
                href={buildPatientContactWhatsAppUrl(
                  detailTarget.patientPhone,
                  detailTarget.patientName
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="whatsapp"
                  className="w-full"
                  leftIcon={<MessageCircle className="w-4 h-4" />}
                >
                  Contact Patient on WhatsApp
                </Button>
              </a>
            </div>
          </div>
        )}
      </Drawer>

      {/* Accept Confirmation */}
      <Modal
        isOpen={Boolean(acceptTarget)}
        onClose={() => setAcceptTarget(null)}
        title="Confirm Appointment Acceptance"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0]">
            Confirm appointment for <strong>{acceptTarget?.patientName}</strong> on{' '}
            <strong>{acceptTarget?.date}</strong> at <strong>{acceptTarget?.time}</strong>?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setAcceptTarget(null)}>
              Cancel
            </Button>
            <Button
              isLoading={submitting}
              onClick={() => acceptTarget && updateStatus(acceptTarget.id, 'Accepted')}
            >
              Confirm Accept
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Reason Modal */}
      <Modal
        isOpen={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        title="Decline Appointment Request"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (rejectTarget && rejectReason.trim()) {
              updateStatus(rejectTarget.id, 'Rejected', rejectReason.trim());
            }
          }}
          className="space-y-4"
        >
          <Textarea
            label="Reason shown to patient"
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" isLoading={submitting}>
              Reject Appointment
            </Button>
          </div>
        </form>
      </Modal>
    </DoctorAdminLayout>
  );
}
