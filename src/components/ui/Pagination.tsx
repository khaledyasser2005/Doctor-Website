import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-1.5 pt-2">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="w-9 h-9 rounded-lg border border-black/10 dark:border-white/10 flex items-center justify-center text-[#5B6470] dark:text-[#9DA5B0] disabled:opacity-40 hover:bg-black/5 dark:hover:bg-white/5"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded-lg text-xs font-semibold tabular-nums transition-colors ${
            p === currentPage
              ? 'bg-[#148F77] dark:bg-[#27C2A4] text-white dark:text-[#080A0D]'
              : 'border border-black/10 dark:border-white/10 text-[#5B6470] dark:text-[#9DA5B0] hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="w-9 h-9 rounded-lg border border-black/10 dark:border-white/10 flex items-center justify-center text-[#5B6470] dark:text-[#9DA5B0] disabled:opacity-40 hover:bg-black/5 dark:hover:bg-white/5"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4 rtl:rotate-180" />
      </button>
    </div>
  );
}
