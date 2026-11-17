import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { notificationApi } from '../../api/notificationApi';
import { NotificationItem } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { PatientLayout } from '../../components/layout/PortalLayouts';
import { Button } from '../../components/ui/Button';
import { EmptyState, SkeletonCard } from '../../components/ui/States';

export function NotificationsPage() {
  const { language, t } = useLanguage();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    notificationApi
      .list()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkRead = async (id: string) => {
    await notificationApi.markRead(id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAll = async () => {
    await notificationApi.markAllRead();
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <PatientLayout>
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-extrabold">{t.patientNav.notifications}</h1>
          {items.some((n) => !n.isRead) && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<CheckCheck className="w-4 h-4" />}
              onClick={handleMarkAll}
            >
              Mark All Read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-5 h-5" />}
            title="No notifications yet"
            description="Updates about your appointment status will appear here."
          />
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => !item.isRead && handleMarkRead(item.id)}
                className={`rounded-2xl border p-5 transition-colors cursor-pointer ${
                  item.isRead
                    ? 'border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A]'
                    : 'border-[#148F77]/35 dark:border-[#27C2A4]/35 bg-[#148F77]/5 dark:bg-[#27C2A4]/8'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">
                      {language === 'ar' ? item.titleAr : item.title}
                    </p>
                    <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0] mt-1 leading-relaxed">
                      {language === 'ar' ? item.descriptionAr : item.description}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-[#5B6470] dark:text-[#9DA5B0] shrink-0">
                    {item.createdAt.slice(0, 10)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PatientLayout>
  );
}
