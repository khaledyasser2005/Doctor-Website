import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#5B6470] dark:text-[#9DA5B0]">
      {items.map((item, idx) => (
        <React.Fragment key={item.label}>
          {idx > 0 && <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 opacity-60" />}
          {item.to ? (
            <Link to={item.to} className="hover:text-[#148F77] dark:hover:text-[#27C2A4] transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-[#0F1419] dark:text-[#F5F7FA]">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
