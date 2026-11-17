import React from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const sizes: Record<NonNullable<AvatarProps['size']>, string> = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover object-top border border-black/10 dark:border-white/10 shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-[#148F77]/15 dark:bg-[#27C2A4]/15 text-[#0F766E] dark:text-[#27C2A4] border border-[#148F77]/20 dark:border-[#27C2A4]/25 font-bold flex items-center justify-center shrink-0 select-none ${className}`}
    >
      {initials || 'P'}
    </div>
  );
}
