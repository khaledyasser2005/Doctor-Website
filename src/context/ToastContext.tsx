import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X, XCircle } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (title: string, description?: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (title: string, description?: string, variant: ToastVariant = 'info') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, title, description, variant }]);
      setTimeout(() => removeToast(id), 4500);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-5 end-5 z-[90] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
        aria-live="polite"
      >
        {toasts.map((item) => {
          const Icon =
            item.variant === 'success'
              ? CheckCircle2
              : item.variant === 'error'
              ? XCircle
              : item.variant === 'warning'
              ? AlertTriangle
              : Info;

          const iconColor =
            item.variant === 'success'
              ? 'text-[#148F77] dark:text-[#27C2A4]'
              : item.variant === 'error'
              ? 'text-red-500'
              : item.variant === 'warning'
              ? 'text-[#A58547] dark:text-[#C8A96B]'
              : 'text-[#148F77] dark:text-[#27C2A4]';

          return (
            <div
              key={item.id}
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#10141A] p-4 shadow-xl"
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0F1419] dark:text-[#F5F7FA]">{item.title}</p>
                {item.description && (
                  <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0] mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(item.id)}
                className="text-[#5B6470] hover:text-[#0F1419] dark:text-[#9DA5B0] dark:hover:text-[#F5F7FA] p-0.5 rounded-lg"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
