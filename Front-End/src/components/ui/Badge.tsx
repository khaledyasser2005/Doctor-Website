import React from 'react';
import { AppointmentStatus } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'teal' | 'amber' | 'red' | 'emerald' | 'gold';
  className?: string;
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  const styles: Record<NonNullable<BadgeProps['variant']>, string> = {
    neutral:
      'bg-black/5 dark:bg-white/5 text-[#5B6470] dark:text-[#9DA5B0] border-black/10 dark:border-white/10',
    teal: 'bg-[#148F77]/10 dark:bg-[#27C2A4]/15 text-[#0F766E] dark:text-[#27C2A4] border-[#148F77]/20 dark:border-[#27C2A4]/25',
    emerald:
      'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
    amber:
      'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25',
    red: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/25',
    gold: 'bg-[#A58547]/10 dark:bg-[#C8A96B]/15 text-[#8A6D33] dark:text-[#C8A96B] border-[#A58547]/25 dark:border-[#C8A96B]/25',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const { t } = useLanguage();
  const variantMap: Record<AppointmentStatus, NonNullable<BadgeProps['variant']>> = {
    Pending: 'amber',
    Accepted: 'teal',
    Completed: 'emerald',
    Rejected: 'red',
    Cancelled: 'neutral',
  };

  return <Badge variant={variantMap[status]}>{t.status[status]}</Badge>;
}
