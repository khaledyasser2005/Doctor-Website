import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'whatsapp';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#27C2A4] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#080A0D] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap select-none';

  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary:
      'bg-[#148F77] hover:bg-[#0F766E] dark:bg-[#27C2A4] dark:hover:bg-[#1FA98E] text-white dark:text-[#080A0D] shadow-sm',
    secondary:
      'bg-[#F0F2F1] hover:bg-[#E4E8E6] dark:bg-[#151B22] dark:hover:bg-[#1B222C] text-[#0F1419] dark:text-[#F5F7FA] border border-black/10 dark:border-white/10',
    outline:
      'bg-transparent border border-black/15 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5 text-[#0F1419] dark:text-[#F5F7FA]',
    ghost:
      'bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-[#5B6470] dark:text-[#9DA5B0] hover:text-[#0F1419] dark:hover:text-[#F5F7FA]',
    danger:
      'bg-red-600 hover:bg-red-700 text-white shadow-sm',
    whatsapp:
      'bg-[#1FAF5A] hover:bg-[#17944A] text-white shadow-sm',
  };

  const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'h-9 px-3.5 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-sm',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : leftIcon}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
}
