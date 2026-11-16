import React from 'react';
import { BadgeCheck, Star } from 'lucide-react';
import { PatientReview } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export function ReviewCard({ review }: { review: PatientReview }) {
  const { language, t } = useLanguage();
  const comment = language === 'ar' && review.commentAr ? review.commentAr : review.comment;

  return (
    <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 flex flex-col justify-between gap-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-0.5 text-[#A58547] dark:text-[#C8A96B]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'opacity-25'}`}
              />
            ))}
          </div>
          {review.verifiedBooking && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#148F77] dark:text-[#27C2A4]">
              <BadgeCheck className="w-3.5 h-3.5" />
              {t.sections.verifiedPatient}
            </span>
          )}
        </div>
        <p className="text-sm text-[#0F1419] dark:text-[#F5F7FA] leading-relaxed">“{comment}”</p>
      </div>

      <div className="flex items-center justify-between text-xs text-[#5B6470] dark:text-[#9DA5B0] pt-3 border-t border-black/6 dark:border-white/6">
        <span className="font-semibold text-[#0F1419] dark:text-[#F5F7FA]">{review.patientName}</span>
        <span className="font-mono">{review.date}</span>
      </div>
    </div>
  );
}
