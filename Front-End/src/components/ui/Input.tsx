import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightElement, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-[#5B6470] dark:text-[#9DA5B0]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute start-3.5 text-[#5B6470] dark:text-[#9DA5B0] pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full h-11 rounded-xl border bg-white dark:bg-[#10141A] text-sm text-[#0F1419] dark:text-[#F5F7FA] placeholder:text-[#5B6470]/60 dark:placeholder:text-[#9DA5B0]/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#27C2A4]/60 ${
              error
                ? 'border-red-500/70 focus:ring-red-500/40'
                : 'border-black/10 dark:border-white/10 focus:border-[#148F77] dark:focus:border-[#27C2A4]'
            } ${leftIcon ? 'ps-10' : 'ps-3.5'} ${rightElement ? 'pe-10' : 'pe-3.5'} ${className}`}
            {...props}
          />
          {rightElement && <div className="absolute end-3 flex items-center">{rightElement}</div>}
        </div>
        {error && <p className="text-xs font-medium text-red-500">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0]">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-[#5B6470] dark:text-[#9DA5B0]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`w-full rounded-xl border bg-white dark:bg-[#10141A] p-3.5 text-sm text-[#0F1419] dark:text-[#F5F7FA] placeholder:text-[#5B6470]/60 dark:placeholder:text-[#9DA5B0]/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#27C2A4]/60 ${
            error
              ? 'border-red-500/70'
              : 'border-black/10 dark:border-white/10 focus:border-[#148F77] dark:focus:border-[#27C2A4]'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs font-medium text-red-500">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
