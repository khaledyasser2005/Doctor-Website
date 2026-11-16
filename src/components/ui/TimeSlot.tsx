import React from 'react';
import { Clock } from 'lucide-react';
import { TimeSlot as TimeSlotType } from '../../types';

interface TimeSlotGridProps {
  slots: TimeSlotType[];
  selectedTime: string;
  onSelectTime: (time: string) => void;
  emptyMessage: string;
}

export function TimeSlotGrid({
  slots,
  selectedTime,
  onSelectTime,
  emptyMessage,
}: TimeSlotGridProps) {
  const openSlots = slots.filter((s) => s.available);

  if (slots.length === 0 || openSlots.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/15 dark:border-white/15 p-8 text-center">
        <Clock className="w-6 h-6 text-[#5B6470] dark:text-[#9DA5B0] mx-auto mb-2" />
        <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
      {slots.map((slot) => {
        const isSelected = selectedTime === slot.time;
        return (
          <button
            key={slot.time}
            type="button"
            disabled={!slot.available}
            onClick={() => onSelectTime(slot.time)}
            title={slot.reason || slot.time}
            className={`h-11 rounded-xl border text-xs sm:text-sm font-semibold tabular-nums transition-all cursor-pointer ${
              isSelected
                ? 'bg-[#148F77] dark:bg-[#27C2A4] border-[#148F77] dark:border-[#27C2A4] text-white dark:text-[#080A0D] shadow-sm'
                : !slot.available
                ? 'border-black/5 dark:border-white/5 bg-black/3 dark:bg-white/[0.02] text-[#5B6470]/40 dark:text-[#9DA5B0]/35 line-through cursor-not-allowed'
                : 'border-black/10 dark:border-white/10 bg-white dark:bg-[#10141A] text-[#0F1419] dark:text-[#F5F7FA] hover:border-[#148F77] dark:hover:border-[#27C2A4]'
            }`}
          >
            {slot.time}
          </button>
        );
      })}
    </div>
  );
}
