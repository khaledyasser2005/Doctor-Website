import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface CalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  minDate?: string;
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function DateCalendar({ selectedDate, onSelectDate, minDate }: CalendarProps) {
  const { language } = useLanguage();
  const todayIso = minDate || toIsoDate(new Date());

  const initialDate = selectedDate ? new Date(`${selectedDate}T12:00:00`) : new Date();
  const [viewMonth, setViewMonth] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );

  useEffect(() => {
    if (selectedDate) {
      const parsed = new Date(`${selectedDate}T12:00:00`);
      if (!Number.isNaN(parsed.getTime())) {
        setViewMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
      }
    }
  }, [selectedDate]);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthLabel = viewMonth.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });

  const weekdays =
    language === 'ar'
      ? ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const cells: Array<{ iso: string; day: number; disabled: boolean } | null> = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const cellDate = new Date(year, month, d);
    const iso = toIsoDate(cellDate);
    cells.push({ iso, day: d, disabled: iso < todayIso });
  }

  return (
    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#10141A] p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setViewMonth(new Date(year, month - 1, 1))}
          className="w-9 h-9 rounded-lg border border-black/10 dark:border-white/10 flex items-center justify-center text-[#5B6470] dark:text-[#9DA5B0] hover:bg-black/5 dark:hover:bg-white/5"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
        </button>
        <span className="text-sm font-bold text-[#0F1419] dark:text-[#F5F7FA]">{monthLabel}</span>
        <button
          type="button"
          onClick={() => setViewMonth(new Date(year, month + 1, 1))}
          className="w-9 h-9 rounded-lg border border-black/10 dark:border-white/10 flex items-center justify-center text-[#5B6470] dark:text-[#9DA5B0] hover:bg-black/5 dark:hover:bg-white/5"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4 rtl:rotate-180" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekdays.map((wd) => (
          <div key={wd} className="text-[11px] font-semibold uppercase text-[#5B6470] dark:text-[#9DA5B0] py-1">
            {wd}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((cell, idx) => {
          if (!cell) return <div key={`empty-${idx}`} />;
          const isSelected = cell.iso === selectedDate;
          const isToday = cell.iso === todayIso;
          return (
            <button
              key={cell.iso}
              type="button"
              disabled={cell.disabled}
              onClick={() => onSelectDate(cell.iso)}
              className={`h-10 rounded-xl text-sm font-semibold tabular-nums transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#148F77] dark:bg-[#27C2A4] text-white dark:text-[#080A0D] shadow-sm'
                  : cell.disabled
                  ? 'text-[#5B6470]/35 dark:text-[#9DA5B0]/30 cursor-not-allowed'
                  : isToday
                  ? 'border border-[#148F77]/40 dark:border-[#27C2A4]/45 text-[#0F766E] dark:text-[#27C2A4] hover:bg-[#148F77]/10 dark:hover:bg-[#27C2A4]/15'
                  : 'text-[#0F1419] dark:text-[#F5F7FA] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
