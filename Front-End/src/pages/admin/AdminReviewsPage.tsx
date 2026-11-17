import React, { useEffect, useState } from 'react';
import { Check, EyeOff, Star, Trash2 } from 'lucide-react';
import { reviewApi } from '../../api/reviewApi';
import { PatientReview } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { DoctorAdminLayout } from '../../components/layout/PortalLayouts';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState, SkeletonCard } from '../../components/ui/States';

export function AdminReviewsPage() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<PatientReview[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    reviewApi
      .listAdmin()
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const toggleApprove = async (rev: PatientReview) => {
    try {
      const updated = await reviewApi.setApproved(rev.id, !rev.approved);
      setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      showToast(updated.approved ? 'Review published to website' : 'Review hidden', undefined, 'success');
    } catch (err) {
      showToast('Failed to update review', err instanceof Error ? err.message : undefined, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await reviewApi.remove(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      showToast('Review deleted', undefined, 'info');
    } catch (err) {
      showToast('Failed to delete review', err instanceof Error ? err.message : undefined, 'error');
    }
  };

  return (
    <DoctorAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold">{t.adminNav.reviews}</h1>
          <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0] mt-1">
            Approve patient feedback before it appears on Al-Shifa Medical Clinic’s public website.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : reviews.length === 0 ? (
          <EmptyState title="No patient reviews yet" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-[#C8A96B]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : 'opacity-25'}`}
                        />
                      ))}
                    </div>
                    <Badge variant={rev.approved ? 'teal' : 'amber'}>
                      {rev.approved ? 'Published' : 'Pending Moderation'}
                    </Badge>
                  </div>
                  <p className="text-sm leading-relaxed">“{rev.comment}”</p>
                  <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0]">
                    {rev.patientName} · <span className="font-mono">{rev.date}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-black/6 dark:border-white/6 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant={rev.approved ? 'secondary' : 'primary'}
                    leftIcon={rev.approved ? <EyeOff className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                    onClick={() => toggleApprove(rev)}
                  >
                    {rev.approved ? 'Hide Review' : 'Approve & Publish'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:bg-red-500/10"
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    onClick={() => handleDelete(rev.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DoctorAdminLayout>
  );
}
