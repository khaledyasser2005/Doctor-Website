import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: React.ReactNode;
  accent?: 'teal' | 'gold' | 'neutral';
}

export function StatCard({ label, value, sublabel, icon, accent = 'teal' }: StatCardProps) {
  const iconBg =
    accent === 'gold'
      ? 'bg-[#A58547]/10 dark:bg-[#C8A96B]/15 text-[#8A6D33] dark:text-[#C8A96B]'
      : accent === 'neutral'
      ? 'bg-black/5 dark:bg-white/5 text-[#5B6470] dark:text-[#9DA5B0]'
      : 'bg-[#148F77]/10 dark:bg-[#27C2A4]/15 text-[#0F766E] dark:text-[#27C2A4]';

  return (
    <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-5 transition-colors hover:border-black/15 dark:hover:border-white/15">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#5B6470] dark:text-[#9DA5B0]">
            {label}
          </p>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F1419] dark:text-[#F5F7FA] tabular-nums">
            {value}
          </p>
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
            {icon}
          </div>
        )}
      </div>
      {sublabel && (
        <p className="mt-3 text-xs text-[#5B6470] dark:text-[#9DA5B0] truncate">{sublabel}</p>
      )}
    </div>
  );
}
