import React, { useEffect, useState } from 'react';
import { CalendarOff, Plus, Trash2 } from 'lucide-react';
import { availabilityApi } from '../../api/availabilityApi';
import { AvailabilitySchedule } from '../../types';
import { DAY_NAMES_EN } from '../../utils/constants';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { DoctorAdminLayout } from '../../components/layout/PortalLayouts';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { SkeletonCard } from '../../components/ui/States';

export function AdminAvailabilityPage() {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [schedule, setSchedule] = useState<AvailabilitySchedule | null>(null);
  const [loading, setLoading] = useState(true);

  const [dayOfWeek, setDayOfWeek] = useState(6);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('14:00');
  const [duration, setDuration] = useState(30);

  const [blockDate, setBlockDate] = useState('');
  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd] = useState('');
  const [blockReason, setBlockReason] = useState('Clinic closed / break');

  const [customDate, setCustomDate] = useState('');
  const [customStart, setCustomStart] = useState('12:00');
  const [customEnd, setCustomEnd] = useState('16:00');

  const load = () => {
    setLoading(true);
    availabilityApi
      .getAdminSchedule()
      .then(setSchedule)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await availabilityApi.addShift({
        dayOfWeek,
        startTime,
        endTime,
        slotDurationMinutes: duration,
      });
      setSchedule((prev) =>
        prev ? { ...prev, weeklyShifts: [...prev.weeklyShifts, created] } : prev
      );
      showToast('Working shift added', undefined, 'success');
    } catch (err) {
      showToast('Error adding shift', err instanceof Error ? err.message : undefined, 'error');
    }
  };

  const handleRemoveShift = async (id: string) => {
    await availabilityApi.removeShift(id);
    setSchedule((prev) =>
      prev ? { ...prev, weeklyShifts: prev.weeklyShifts.filter((s) => s.id !== id) } : prev
    );
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDate) return;
    try {
      const created = await availabilityApi.addBlockedSlot({
        date: blockDate,
        startTime: blockStart || undefined,
        endTime: blockEnd || undefined,
        reason: blockReason,
      });
      setSchedule((prev) =>
        prev ? { ...prev, blockedSlots: [...prev.blockedSlots, created] } : prev
      );
      setBlockDate('');
      showToast('Time blocked', undefined, 'success');
    } catch (err) {
      showToast('Failed to block time', err instanceof Error ? err.message : undefined, 'error');
    }
  };

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDate) return;
    try {
      const created = await availabilityApi.addCustomDate({
        date: customDate,
        startTime: customStart,
        endTime: customEnd,
        slotDurationMinutes: 30,
      });
      setSchedule((prev) =>
        prev ? { ...prev, customDates: [...prev.customDates, created] } : prev
      );
      setCustomDate('');
      showToast('Custom date hours saved', undefined, 'success');
    } catch (err) {
      showToast('Failed to save custom hours', err instanceof Error ? err.message : undefined, 'error');
    }
  };

  return (
    <DoctorAdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold">{t.adminNav.availability}</h1>
          <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0] mt-1">
            Configure recurring weekly hours, slot duration, blocked dates/breaks, and special dates.
          </p>
        </div>

        {loading || !schedule ? (
          <SkeletonCard />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Weekly Working Shifts */}
            <div className="lg:col-span-7 rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 space-y-6">
              <h2 className="text-base font-bold">Weekly Working Hours</h2>

              <form onSubmit={handleAddShift} className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
                <div className="col-span-2 sm:col-span-2">
                  <Select
                    label="Day"
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(Number(e.target.value))}
                    options={DAY_NAMES_EN.map((name, idx) => ({ value: idx, label: name }))}
                  />
                </div>
                <Input
                  label="Start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
                <Input
                  label="End"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
                <Button type="submit" leftIcon={<Plus className="w-4 h-4" />}>
                  Add
                </Button>
              </form>

              <div className="flex items-center gap-3 text-xs text-[#5B6470] dark:text-[#9DA5B0]">
                <span>Slot duration (minutes):</span>
                {[20, 30, 45, 60].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDuration(m)}
                    className={`px-2.5 py-1 rounded-lg font-mono font-semibold cursor-pointer ${
                      duration === m
                        ? 'bg-[#148F77] dark:bg-[#27C2A4] text-white dark:text-[#080A0D]'
                        : 'border border-black/10 dark:border-white/10'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>

              <div className="space-y-2.5">
                {schedule.weeklyShifts.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-xl border border-black/8 dark:border-white/8 bg-[#F6F7F5] dark:bg-[#151B22] px-4 py-3 flex items-center justify-between"
                  >
                    <div className="text-sm">
                      <span className="font-bold">{DAY_NAMES_EN[s.dayOfWeek]}</span>
                      <span className="font-mono text-xs text-[#5B6470] dark:text-[#9DA5B0] ms-3">
                        {s.startTime} – {s.endTime} ({s.slotDurationMinutes} min slots)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveShift(s.id)}
                      className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg"
                      aria-label="Remove shift"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Blocked Days & Custom Dates */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 space-y-4">
                <h2 className="text-base font-bold flex items-center gap-2">
                  <CalendarOff className="w-4 h-4 text-amber-500" />
                  Block Date or Break Time
                </h2>
                <form onSubmit={handleAddBlock} className="space-y-3">
                  <Input
                    label="Date"
                    type="date"
                    value={blockDate}
                    onChange={(e) => setBlockDate(e.target.value)}
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Start (Optional)"
                      type="time"
                      value={blockStart}
                      onChange={(e) => setBlockStart(e.target.value)}
                    />
                    <Input
                      label="End (Optional)"
                      type="time"
                      value={blockEnd}
                      onChange={(e) => setBlockEnd(e.target.value)}
                    />
                  </div>
                  <Input
                    label="Reason"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                  />
                  <Button type="submit" variant="secondary" className="w-full">
                    Block Selected Date / Hours
                  </Button>
                </form>

                <div className="space-y-2">
                  {schedule.blockedSlots.map((b) => (
                    <div
                      key={b.id}
                      className="rounded-xl border border-amber-500/25 bg-amber-500/8 px-3.5 py-2.5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-mono font-bold">{b.date}</p>
                        <p className="text-[#5B6470] dark:text-[#9DA5B0]">
                          {b.startTime ? `${b.startTime} – ${b.endTime}` : 'Full Day'} · {b.reason}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await availabilityApi.removeBlockedSlot(b.id);
                          setSchedule((prev) =>
                            prev
                              ? { ...prev, blockedSlots: prev.blockedSlots.filter((x) => x.id !== b.id) }
                              : prev
                          );
                        }}
                        className="text-red-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 space-y-4">
                <h2 className="text-base font-bold">Custom Special Date Override</h2>
                <form onSubmit={handleAddCustom} className="space-y-3">
                  <Input
                    label="Date"
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Start"
                      type="time"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                    />
                    <Input
                      label="End"
                      type="time"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                    />
                  </div>
                  <Button type="submit" variant="secondary" className="w-full">
                    Save Custom Date Hours
                  </Button>
                </form>

                {schedule.customDates.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-[#27C2A4]/25 bg-[#27C2A4]/8 px-3.5 py-2.5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-mono font-bold">{c.date}</p>
                      <p>
                        {c.startTime} – {c.endTime}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await availabilityApi.removeCustomDate(c.id);
                        setSchedule((prev) =>
                          prev
                            ? { ...prev, customDates: prev.customDates.filter((x) => x.id !== c.id) }
                            : prev
                        );
                      }}
                      className="text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DoctorAdminLayout>
  );
}
