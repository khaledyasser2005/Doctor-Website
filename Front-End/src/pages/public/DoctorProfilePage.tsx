import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus, CheckCircle2, MapPin, MessageCircle } from 'lucide-react';
import { doctorApi } from '../../api/doctorApi';
import { analyticsApi } from '../../api/analyticsApi';
import { PublicPracticeBundle } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { DOCTOR_PORTRAIT_URL } from '../../utils/constants';
import { buildGeneralWhatsAppUrl } from '../../utils/whatsapp';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { Footer } from '../../components/layout/Footer';
import { FloatingWhatsAppButton } from '../../components/layout/FloatingWhatsAppButton';
import { CertificateGallery } from '../../components/practice/CertificateGallery';
import { ReviewCard } from '../../components/practice/ReviewCard';
import { Button } from '../../components/ui/Button';
import { ErrorState, SkeletonCard } from '../../components/ui/States';

export function DoctorProfileContent({ insidePortal = false }: { insidePortal?: boolean }) {
  const { language, t } = useLanguage();
  const [bundle, setBundle] = useState<PublicPracticeBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyticsApi.track('profile_view', '/doctor');
    doctorApi
      .getPublicPractice()
      .then(setBundle)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4 space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <ErrorState description={error || undefined} />
      </div>
    );
  }

  const { doctor, certificates, reviews } = bundle;
  const isAr = language === 'ar';
  const docName = isAr ? doctor.fullNameAr : doctor.fullName;
  const specialty = isAr ? doctor.specialtyAr : doctor.specialty;
  const conditions = isAr ? doctor.conditionsTreatedAr : doctor.conditionsTreated;
  const bookHref = insidePortal ? '/patient/book' : '/book';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      <div className="rounded-3xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-4">
          <div className="rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-[#151B22]">
            <img
              src={doctor.portraitUrl || DOCTOR_PORTRAIT_URL}
              alt={isAr ? doctor.clinicNameAr : doctor.clinicName}
              className="w-full aspect-[4/5] object-cover"
            />
          </div>
        </div>
        <div className="lg:col-span-8 space-y-5">
          <div>
            <p className="text-xs font-mono font-semibold uppercase tracking-widest text-[#148F77] dark:text-[#27C2A4]">
              {t.brandSubtitle} · {specialty}
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold mt-2">{docName}</h1>
            <p className="text-base text-[#5B6470] dark:text-[#9DA5B0] mt-2">
              {isAr ? doctor.headlineAr : doctor.headline}
            </p>
          </div>
          <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0] leading-relaxed">
            {isAr ? doctor.bioAr : doctor.bio}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-black/6 dark:border-white/6 text-xs">
            <div>
              <p className="text-[#5B6470] dark:text-[#9DA5B0] uppercase font-semibold">
                {t.hero.experienceLabel}
              </p>
              <p className="text-sm font-bold mt-1">{doctor.experienceYears}</p>
            </div>
            <div>
              <p className="text-[#5B6470] dark:text-[#9DA5B0] uppercase font-semibold">
                {t.booking.clinicVisit}
              </p>
              <p className="text-sm font-bold font-mono mt-1">
                {doctor.consultationFeeClinic} {doctor.currency}
              </p>
            </div>
            <div>
              <p className="text-[#5B6470] dark:text-[#9DA5B0] uppercase font-semibold">
                {t.booking.onlineConsult}
              </p>
              <p className="text-sm font-bold font-mono mt-1">
                {doctor.consultationFeeOnline} {doctor.currency}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to={bookHref}>
              <Button leftIcon={<CalendarPlus className="w-4 h-4" />}>
                {t.nav.bookAppointment}
              </Button>
            </Link>
            <a href={buildGeneralWhatsAppUrl(language)} target="_blank" rel="noopener noreferrer">
              <Button variant="whatsapp" leftIcon={<MessageCircle className="w-4 h-4" />}>
                {t.whatsapp.chatCta}
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Conditions & Clinic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 space-y-4">
          <h2 className="text-lg font-bold">{t.sections.conditionsTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {conditions.map((c) => (
              <div key={c} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#148F77] dark:text-[#27C2A4] shrink-0 mt-0.5" />
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 space-y-4">
          <h2 className="text-lg font-bold">{t.sections.clinicTitle}</h2>
          <p className="text-sm font-semibold">{isAr ? doctor.clinicNameAr : doctor.clinicName}</p>
          <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0] flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#148F77] dark:text-[#27C2A4]" />
            <span>{isAr ? doctor.clinicAddressAr : doctor.clinicAddress}</span>
          </p>
          <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0]">
            {isAr ? doctor.clinicHoursSummaryAr : doctor.clinicHoursSummary}
          </p>
        </div>
      </div>

      {/* Certificates */}
      <div className="space-y-6">
        <h2 className="text-2xl font-extrabold">{t.sections.certificatesTitle}</h2>
        <CertificateGallery certificates={certificates} />
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-extrabold">{t.sections.reviewsTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function DoctorProfilePage() {
  return (
    <div className="min-h-screen bg-transparent text-[#0F1419] dark:text-[#F5F7FA]">
      <PublicNavbar />
      <DoctorProfileContent />
      <Footer />
      <FloatingWhatsAppButton />
    </div>
  );
}
