import React from 'react';

export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] ${className}`}
    >
      {children}
    </div>
  );
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: Array<{ id: string; label: string; count?: number }>;
  activeTab: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-black/10 dark:border-white/10 bg-[#F0F2F1] dark:bg-[#10141A] p-1">
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              active
                ? 'bg-white dark:bg-[#151B22] text-[#0F1419] dark:text-[#F5F7FA] shadow-xs'
                : 'text-[#5B6470] dark:text-[#9DA5B0] hover:text-[#0F1419] dark:hover:text-[#F5F7FA]'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`px-1.5 py-0.2 rounded-md text-[11px] tabular-nums ${
                  active
                    ? 'bg-[#148F77]/15 dark:bg-[#27C2A4]/15 text-[#0F766E] dark:text-[#27C2A4]'
                    : 'bg-black/5 dark:bg-white/5 text-[#5B6470] dark:text-[#9DA5B0]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
