import React, { useEffect, useState } from 'react';
import { MessageCircle, Search, UserCheck, UserX } from 'lucide-react';
import { patientApi, PatientSummary } from '../../api/patientApi';
import { Appointment, User } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { buildPatientContactWhatsAppUrl } from '../../utils/whatsapp';
import { DoctorAdminLayout } from '../../components/layout/PortalLayouts';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { Badge, AppointmentStatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Drawer } from '../../components/ui/Drawer';
import { EmptyState, ErrorState, SkeletonCard } from '../../components/ui/States';

export function AdminPatientsPage() {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState<'all' | 'google' | 'local'>('all');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detail, setDetail] = useState<{ patient: User; appointments: Appointment[] } | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setPatients(await patientApi.listAdminPatients());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load patients.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openPatient = async (id: string) => {
    setDrawerOpen(true);
    setDetail(null);
    try {
      setDetail(await patientApi.getAdminPatientDetail(id));
    } catch (err) {
      showToast('Failed to load patient record', err instanceof Error ? err.message : undefined, 'error');
    }
  };

  const toggleActive = async (p: PatientSummary) => {
    try {
      const updated = await patientApi.setAdminPatientActive(p.id, !p.isActive);
      setPatients((prev) =>
        prev.map((item) => (item.id === updated.id ? { ...item, isActive: updated.isActive } : item))
      );
      if (detail?.patient.id === updated.id) {
        setDetail({ ...detail, patient: updated });
      }
      showToast(
        updated.isActive ? 'Patient account activated' : 'Patient account deactivated',
        undefined,
        'info'
      );
    } catch (err) {
      showToast('Action failed', err instanceof Error ? err.message : undefined, 'error');
    }
  };

  const filtered = patients.filter((p) => {
    const matchesProvider =
      providerFilter === 'all' || p.authProvider === providerFilter;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      p.fullName.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.phone.toLowerCase().includes(q);
    return matchesProvider && matchesQuery;
  });

  const googleCount = patients.filter((p) => p.authProvider === 'google').length;
  const localCount = patients.filter((p) => p.authProvider !== 'google').length;

  return (
    <DoctorAdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold">{t.adminNav.patients}</h1>
            <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0] mt-1">
              Complete directory of registered patients, Google sign-ins, consultation history, and access control.
            </p>
          </div>
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search name, email, phone..."
              leftIcon={<Search className="w-4 h-4" />}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all' as const, label: `All Patients (${patients.length})` },
            { id: 'google' as const, label: `Google Sign-In (${googleCount})` },
            { id: 'local' as const, label: `Email Accounts (${localCount})` },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setProviderFilter(f.id)}
              className={`h-9 px-3.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                providerFilter === f.id
                  ? 'bg-[#148F77] text-white border-[#148F77]'
                  : 'border-black/10 dark:border-white/10 bg-white dark:bg-[#10141A] text-[#5B6470] dark:text-[#9DA5B0]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <ErrorState description={error} onRetry={load} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No patients found" />
        ) : (
          <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead className="border-b border-black/8 dark:border-white/8 bg-[#F6F7F5] dark:bg-[#151B22] text-xs uppercase text-[#5B6470] dark:text-[#9DA5B0]">
                  <tr>
                    <th className="py-3.5 px-4 text-start">Patient</th>
                    <th className="py-3.5 px-4 text-start">Contact</th>
                    <th className="py-3.5 px-4 text-start">Visits</th>
                    <th className="py-3.5 px-4 text-start">Status</th>
                    <th className="py-3.5 px-4 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/6 dark:divide-white/6">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={p.avatarUrl} name={p.fullName} size="sm" />
                          <div>
                            <p className="font-bold">{p.fullName}</p>
                            <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0]">
                              {p.authProvider === 'google' ? 'Google Account' : 'Email Account'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <p>{p.email}</p>
                        <p className="text-[#5B6470] dark:text-[#9DA5B0]">{p.phone || '—'}</p>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">
                        {p.appointmentCount} ({p.lastAppointmentDate || 'None'})
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={p.isActive ? 'teal' : 'red'}>
                          {p.isActive ? 'Active' : 'Deactivated'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="secondary" onClick={() => openPatient(p.id)}>
                            History
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleActive(p)}
                            leftIcon={
                              p.isActive ? (
                                <UserX className="w-3.5 h-3.5 text-red-500" />
                              ) : (
                                <UserCheck className="w-3.5 h-3.5 text-[#27C2A4]" />
                              )
                            }
                          >
                            {p.isActive ? 'Deactivate' : 'Activate'}
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

      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={detail?.patient.fullName || 'Patient Record'}
      >
        {!detail ? (
          <SkeletonCard />
        ) : (
          <div className="space-y-6 text-sm">
            <div className="rounded-xl border border-black/8 dark:border-white/8 bg-[#F6F7F5] dark:bg-[#151B22] p-4 space-y-2">
              <p>
                <strong>Email:</strong> {detail.patient.email}
              </p>
              <p>
                <strong>Phone:</strong> {detail.patient.phone || '—'}
              </p>
              <p>
                <strong>DOB:</strong> {detail.patient.dateOfBirth || '—'}
              </p>
              <p>
                <strong>Allergies:</strong> {detail.patient.allergies || 'None listed'}
              </p>
            </div>

            {detail.patient.phone && (
              <a
                href={buildPatientContactWhatsAppUrl(
                  detail.patient.phone,
                  detail.patient.fullName
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="whatsapp"
                  className="w-full"
                  leftIcon={<MessageCircle className="w-4 h-4" />}
                >
                  WhatsApp Patient
                </Button>
              </a>
            )}

            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5B6470] dark:text-[#9DA5B0]">
                Appointment History ({detail.appointments.length})
              </h3>
              {detail.appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="rounded-xl border border-black/8 dark:border-white/8 p-3.5 flex items-center justify-between"
                >
                  <div>
                    <p className="font-mono text-xs font-bold">{apt.date} · {apt.time}</p>
                    <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0]">
                      {apt.bookingCode} · {apt.consultationType}
                    </p>
                  </div>
                  <AppointmentStatusBadge status={apt.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </Drawer>
    </DoctorAdminLayout>
  );
}
