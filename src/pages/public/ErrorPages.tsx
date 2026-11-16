import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, ShieldAlert } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4">
      <div className="max-w-md w-full text-center space-y-5">
        <p className="text-xs font-mono font-semibold uppercase tracking-widest text-[#148F77] dark:text-[#27C2A4]">
          404 · Not Found
        </p>
        <h1 className="text-3xl font-extrabold text-[#0F1419] dark:text-[#F5F7FA]">
          Page could not be found
        </h1>
        <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0]">
          The page you requested may have moved or does not exist.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link to="/">
            <Button leftIcon={<ArrowLeft className="w-4 h-4 rtl:rotate-180" />}>
              Return Home
            </Button>
          </Link>
          <Link to="/book">
            <Button variant="secondary">Book Appointment</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4">
      <div className="max-w-md w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#10141A] p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <p className="text-xs font-mono font-semibold uppercase tracking-widest text-red-500">
          403 · Forbidden
        </p>
        <h1 className="text-2xl font-extrabold text-[#0F1419] dark:text-[#F5F7FA]">
          Access Restricted
        </h1>
        <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0]">
          Your account does not have authorization to view this area.
        </p>
        <div className="pt-2">
          <Link to="/">
            <Button>Back to Practice Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ServerErrorPage({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4">
      <div className="max-w-md w-full text-center space-y-5">
        <p className="text-xs font-mono font-semibold uppercase tracking-widest text-amber-500">
          500 · Server Error
        </p>
        <h1 className="text-3xl font-extrabold text-[#0F1419] dark:text-[#F5F7FA]">
          Temporary Service Issue
        </h1>
        <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0]">
          We encountered an unexpected error communicating with the practice server.
        </p>
        <div className="flex justify-center gap-3">
          <Button
            onClick={() => (onRetry ? onRetry() : window.location.reload())}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Try Again
          </Button>
          <Link to="/">
            <Button variant="secondary">Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
