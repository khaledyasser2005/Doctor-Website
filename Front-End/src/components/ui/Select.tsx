import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string | number; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    const selectId = id || props.name;
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold uppercase tracking-wider text-[#5B6470] dark:text-[#9DA5B0]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`w-full h-11 appearance-none rounded-xl border bg-white dark:bg-[#10141A] ps-3.5 pe-10 text-sm text-[#0F1419] dark:text-[#F5F7FA] transition-colors focus:outline-none focus:ring-2 focus:ring-[#27C2A4]/60 ${
              error
                ? 'border-red-500/70'
                : 'border-black/10 dark:border-white/10 focus:border-[#148F77] dark:focus:border-[#27C2A4]'
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-[#5B6470] dark:text-[#9DA5B0] pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2" />
        </div>
        {error && <p className="text-xs font-medium text-red-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
