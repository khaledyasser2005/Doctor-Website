import React, { useEffect, useState } from 'react';
import { AlertTriangle, Inbox, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from './Button';

export function FullPageLoader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F7F5] dark:bg-[#080A0D] text-[#0F1419] dark:text-[#F5F7FA] gap-3">
      <div className="w-9 h-9 rounded-full border-2 border-[#148F77]/25 dark:border-[#27C2A4]/25 border-t-[#148F77] dark:border-t-[#27C2A4] animate-spin" />
      <p className="text-sm font-medium text-[#5B6470] dark:text-[#9DA5B0]">{label}</p>
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 animate-pulse ${className}`}
    >
      <div className="h-3 w-24 rounded bg-black/10 dark:bg-white/10" />
      <div className="h-7 w-32 rounded bg-black/10 dark:bg-white/10 mt-3" />
      <div className="h-3 w-48 rounded bg-black/5 dark:bg-white/5 mt-4" />
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-black/12 dark:border-white/12 bg-white/60 dark:bg-[#10141A]/60 p-10 text-center flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-2xl bg-[#148F77]/10 dark:bg-[#27C2A4]/12 text-[#0F766E] dark:text-[#27C2A4] flex items-center justify-center mb-4">
        {icon || <Inbox className="w-5 h-5" />}
      </div>
      <h3 className="text-base font-bold text-[#0F1419] dark:text-[#F5F7FA]">{title}</h3>
      {description && (
        <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0] mt-1.5 max-w-md">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We could not load this data right now. Please try again.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center flex flex-col items-center">
      <div className="w-11 h-11 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center mb-3">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h3 className="text-base font-bold text-[#0F1419] dark:text-[#F5F7FA]">{title}</h3>
      <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0] mt-1 max-w-md">{description}</p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={onRetry}
        >
          Retry
        </Button>
      )}
    </div>
  );
}

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 start-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-[#10141A] px-4 py-2.5 text-xs font-semibold text-amber-300 shadow-2xl">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>You appear to be offline. Reconnect to sync clinic availability.</span>
    </div>
  );
}
