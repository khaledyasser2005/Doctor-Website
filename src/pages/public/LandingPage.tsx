import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  CalendarCheck,
  CalendarPlus,
  CheckCircle2,
  Clock,
  FileCheck2,
  HeartPulse,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ShieldCheck,
  Star,
  Stethoscope,
  Video,
} from 'lucide-react';
import { doctorApi } from '../../api/doctorApi';
import { reviewApi } from '../../api/reviewApi';
import { analyticsApi } from '../../api/analyticsApi';
import { PublicPracticeBundle } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  CLINIC_FACADE_IMAGE,
  CLINIC_SUITE_IMAGE,
  DOCTOR_PORTRAIT_URL,
  HERO_CLINIC_IMAGE,
  WHATSAPP_DISPLAY,
} from '../../utils/constants';
import { buildGeneralWhatsAppUrl } from '../../utils/whatsapp';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { Footer } from '../../components/layout/Footer';
import { FloatingWhatsAppButton } from '../../components/layout/FloatingWhatsAppButton';
import { ScrollProgressBar } from '../../components/ui/ScrollProgressBar';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { ErrorState, SkeletonCard } from '../../components/ui/States';
import { CertificateGallery } from '../../components/practice/CertificateGallery';
import { ReviewCard } from '../../components/practice/ReviewCard';

function getServiceIcon(iconName: string) {
  switch (iconName) {
    case 'Video':
      return <Video className="w-5 h-5" />;
    case 'FileCheck2':
      return <FileCheck2 className="w-5 h-5" />;
    case 'HeartPulse':
      return <HeartPulse className="w-5 h-5" />;
    default:
      return <Stethoscope className="w-5 h-5" />;
  }
}

export function LandingPage() {
  const { language, t } = useLanguage();
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bundle, setBundle] = useState<PublicPracticeBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review Modal State
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadPractice = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await doctorApi.getPublicPractice();
      setBundle(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load practice profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPractice();
    analyticsApi.track('page_view', '/');
  }, []);

  useEffect(() => {
    if (user?.fullName && !reviewName) {
      setReviewName(user.fullName);
    }
  }, [user, reviewName]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      showToast('Please enter your name and review comment.', undefined, 'warning');
      return;
    }
    setSubmittingReview(true);
    try {
      await reviewApi.submit({
        patientName: reviewName.trim(),
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setReviewOpen(false);
      setReviewComment('');
      showToast(
        language === 'ar' ? 'شكراً لتقييمك' : 'Thank you for your review',
        language === 'ar'
          ? 'سيتم نشر التقييم بعد المراجعة من العيادة.'
          : 'Your feedback has been submitted for approval.',
        'success'
      );
    } catch (err) {
      showToast(
        'Could not submit review',
        err instanceof Error ? err.message : undefined,
        'error'
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F7F5] dark:bg-[#080A0D]">
        <PublicNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <div className="lg:col-span-5">
              <SkeletonCard className="h-[440px]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="min-h-screen bg-[#F6F7F5] dark:bg-[#080A0D]">
        <PublicNavbar />
        <div className="max-w-2xl mx-auto px-4 py-24">
          <ErrorState description={error || undefined} onRetry={loadPractice} />
        </div>
      </div>
    );
  }

  const { doctor, certificates, reviews } = bundle;
  const isAr = language === 'ar';
  const docName = isAr ? doctor.fullNameAr : doctor.fullName;
  const specialty = isAr ? doctor.specialtyAr : doctor.specialty;
  const headline = isAr ? doctor.headlineAr : doctor.headline;
  const bio = isAr ? doctor.bioAr : doctor.bio;
  const philosophy = isAr ? doctor.philosophyAr : doctor.philosophy;
  const clinicName = isAr ? doctor.clinicNameAr : doctor.clinicName;
  const clinicAddress = isAr ? doctor.clinicAddressAr : doctor.clinicAddress;
  const clinicHours = isAr ? doctor.clinicHoursSummaryAr : doctor.clinicHoursSummary;
  const conditions = isAr ? doctor.conditionsTreatedAr : doctor.conditionsTreated;
  const waUrl = buildGeneralWhatsAppUrl(language);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  const mapsApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim();
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    clinicAddress && !clinicAddress.startsWith('[')
      ? clinicAddress
      : `${doctor.clinicLatitude},${doctor.clinicLongitude}`
  )}`;

  return (
    <div className="min-h-screen bg-transparent text-[#0F1419] dark:text-[#F5F7FA]">
      <ScrollProgressBar />
      <PublicNavbar />

      {/* 1. HERO SECTION */}
      <section
        id="hero"
        className="relative overflow-hidden border-b border-black/8 dark:border-white/8"
      >
        <div className="absolute inset-0 bg-editorial-grid pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Editorial Column */}
          <div className="lg:col-span-7 space-y-7">
            <div className="space-y-3">
              <p className="text-xs font-mono font-semibold uppercase tracking-[0.18em] text-[#148F77] dark:text-[#27C2A4]">
                {clinicName} · {clinicAddress}
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0F1419] dark:text-[#F5F7FA] leading-[1.05]">
                {clinicName}
              </h1>
              <p className="text-lg sm:text-xl font-medium text-[#5B6470] dark:text-[#9DA5B0] max-w-2xl">
                {docName} · {specialty} — {headline}
              </p>
            </div>

            <p className="text-sm sm:text-base text-[#5B6470] dark:text-[#9DA5B0] leading-relaxed max-w-xl">
              {bio}
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                onClick={() => {
                  analyticsApi.track('book_click', '/#hero');
                  navigate('/book');
                }}
                leftIcon={<CalendarPlus className="w-4 h-4" />}
              >
                {t.hero.primaryCta}
              </Button>
              <Link to="/doctor">
                <Button
                  variant="secondary"
                  size="lg"
                  rightIcon={<ArrowRight className="w-4 h-4 rtl:rotate-180" />}
                >
                  {t.hero.secondaryCta}
                </Button>
              </Link>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => analyticsApi.track('whatsapp_click', '/#hero')}
                className="inline-flex items-center gap-2 h-12 px-5 rounded-xl border border-black/12 dark:border-white/12 bg-white/80 dark:bg-[#10141A]/90 text-sm font-semibold hover:border-[#1FAF5A] transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#1FAF5A]" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Key Practice Summary Strip (Zero Pill Clutter) */}
            <div className="pt-4 border-t border-black/8 dark:border-white/8 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5B6470] dark:text-[#9DA5B0]">
                  {t.hero.experienceLabel}
                </p>
                <p className="text-sm font-bold text-[#0F1419] dark:text-[#F5F7FA] mt-1">
                  {doctor.experienceYears}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5B6470] dark:text-[#9DA5B0]">
                  {t.hero.clinicLocationLabel}
                </p>
                <p className="text-sm font-bold text-[#0F1419] dark:text-[#F5F7FA] mt-1 truncate">
                  {clinicAddress}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5B6470] dark:text-[#9DA5B0]">
                  {t.hero.consultationModesLabel}
                </p>
                <p className="text-sm font-bold text-[#0F1419] dark:text-[#F5F7FA] mt-1">
                  {t.booking.clinicVisit} · {t.booking.onlineConsult}
                </p>
              </div>
            </div>
          </div>

          {/* Right Official Portrait Column */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              <div className="relative rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 bg-[#10141A] shadow-2xl">
                <img
                  src={doctor.portraitUrl || DOCTOR_PORTRAIT_URL}
                  alt={clinicName}
                  className="w-full aspect-[4/5] object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
                <div className="absolute bottom-4 inset-x-5 flex items-end justify-between gap-2 text-white">
                  <div>
                    <p className="text-sm font-bold">{clinicName}</p>
                    <p className="text-xs text-white/80">{clinicAddress}</p>
                  </div>
                  <span className="text-xs font-mono text-[#27C2A4] font-semibold">
                    {clinicHours}
                  </span>
                </div>
              </div>

              {/* Floating Info Card 1 */}
              <div className="hidden sm:flex items-center gap-2.5 rounded-2xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-[#10141A]/95 backdrop-blur-md px-4 py-3 shadow-xl absolute -top-4 -start-5">
                <div className="w-8 h-8 rounded-xl bg-[#148F77]/12 dark:bg-[#27C2A4]/15 text-[#0F766E] dark:text-[#27C2A4] flex items-center justify-center">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F1419] dark:text-[#F5F7FA]">
                    {t.hero.availableBadge}
                  </p>
                  <p className="text-[11px] text-[#5B6470] dark:text-[#9DA5B0]">
                    {t.booking.clinicVisit} & {t.booking.onlineConsult}
                  </p>
                </div>
              </div>

              {/* Floating Info Card 2 */}
              <div className="hidden sm:flex items-center gap-2.5 rounded-2xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-[#10141A]/95 backdrop-blur-md px-4 py-3 shadow-xl absolute -bottom-4 -end-4">
                <div className="w-8 h-8 rounded-xl bg-[#A58547]/15 dark:bg-[#C8A96B]/15 text-[#8A6D33] dark:text-[#C8A96B] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F1419] dark:text-[#F5F7FA]">
                    {t.hero.trustedBadge}
                  </p>
                  <p className="text-[11px] text-[#5B6470] dark:text-[#9DA5B0] tabular-nums">
                    ★ {avgRating} ({reviews.length})
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT & PHILOSOPHY SECTION */}
      <section id="about" className="py-16 lg:py-24 border-b border-black/8 dark:border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-5">
            <div className="rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 bg-[#10141A] shadow-xl">
              <img
                src={CLINIC_SUITE_IMAGE}
                alt={clinicName}
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
          </div>
          <div className="lg:col-span-7 space-y-6">
            <div>
              <p className="text-xs font-mono font-semibold uppercase tracking-[0.18em] text-[#148F77] dark:text-[#27C2A4]">
                {t.sections.aboutKicker}
              </p>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F1419] dark:text-[#F5F7FA] mt-2 text-balance">
                {t.sections.aboutTitle}
              </h2>
            </div>

            <p className="text-base text-[#5B6470] dark:text-[#9DA5B0] leading-relaxed">{bio}</p>

            <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#8A6D33] dark:text-[#C8A96B]">
                {t.sections.philosophyTitle}
              </p>
              <p className="text-sm text-[#0F1419] dark:text-[#F5F7FA] leading-relaxed">
                {philosophy}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SPECIALIZATION & SERVICES */}
      <section
        id="specialization"
        className="py-16 lg:py-24 border-b border-black/8 dark:border-white/8 bg-white/40 dark:bg-[#10141A]/35"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-mono font-semibold uppercase tracking-[0.18em] text-[#148F77] dark:text-[#27C2A4]">
                {t.sections.specializationKicker}
              </p>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F1419] dark:text-[#F5F7FA] mt-2">
                {t.sections.specializationTitle}
              </h2>
            </div>
            <p className="text-sm font-semibold text-[#5B6470] dark:text-[#9DA5B0]">
              {specialty}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {doctor.services.map((srv) => (
              <div
                key={srv.id}
                className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#148F77]/12 dark:bg-[#27C2A4]/15 text-[#0F766E] dark:text-[#27C2A4] flex items-center justify-center">
                  {getServiceIcon(srv.iconName)}
                </div>
                <h3 className="text-base font-bold text-[#0F1419] dark:text-[#F5F7FA]">
                  {isAr ? srv.nameAr : srv.name}
                </h3>
                <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0] leading-relaxed">
                  {isAr ? srv.descriptionAr : srv.description}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 sm:p-8">
            <h3 className="text-base font-bold text-[#0F1419] dark:text-[#F5F7FA] mb-5">
              {t.sections.conditionsTitle}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {conditions.map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#148F77] dark:text-[#27C2A4] shrink-0 mt-0.5" />
                  <span className="text-[#0F1419] dark:text-[#F5F7FA]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. EXPERIENCE & QUALIFICATIONS TIMELINE */}
      <section className="py-16 lg:py-24 border-b border-black/8 dark:border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          <div>
            <p className="text-xs font-mono font-semibold uppercase tracking-[0.18em] text-[#148F77] dark:text-[#27C2A4]">
              {t.sections.timelineKicker}
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F1419] dark:text-[#F5F7FA] mt-2">
              {t.sections.timelineTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {doctor.qualifications.map((q) => (
              <div
                key={q.id}
                className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 space-y-3"
              >
                <span className="text-xs font-mono font-bold text-[#148F77] dark:text-[#27C2A4]">
                  {q.year}
                </span>
                <h3 className="text-base font-bold text-[#0F1419] dark:text-[#F5F7FA]">
                  {isAr ? q.titleAr : q.title}
                </h3>
                <p className="text-xs font-semibold text-[#8A6D33] dark:text-[#C8A96B]">
                  {isAr ? q.institutionAr : q.institution}
                </p>
                <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0] leading-relaxed">
                  {isAr ? q.descriptionAr : q.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CERTIFICATES & ACCREDITATIONS GALLERY */}
      <section
        id="certificates"
        className="py-16 lg:py-24 border-b border-black/8 dark:border-white/8 bg-white/40 dark:bg-[#10141A]/35"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-mono font-semibold uppercase tracking-[0.18em] text-[#148F77] dark:text-[#27C2A4]">
                {t.sections.certificatesKicker}
              </p>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F1419] dark:text-[#F5F7FA] mt-2">
                {t.sections.certificatesTitle}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#5B6470] dark:text-[#9DA5B0]">
              <Award className="w-4 h-4 text-[#8A6D33] dark:text-[#C8A96B]" />
              <span>{certificates.length} verified records</span>
            </div>
          </div>

          <CertificateGallery certificates={certificates} />
        </div>
      </section>

      {/* 6. PATIENT REVIEWS */}
      <section id="reviews" className="py-16 lg:py-24 border-b border-black/8 dark:border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-mono font-semibold uppercase tracking-[0.18em] text-[#148F77] dark:text-[#27C2A4]">
                {t.sections.reviewsKicker}
              </p>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F1419] dark:text-[#F5F7FA] mt-2">
                {t.sections.reviewsTitle}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm font-bold tabular-nums">
                <Star className="w-4 h-4 text-[#A58547] dark:text-[#C8A96B] fill-current" />
                <span>{avgRating}</span>
                <span className="text-xs font-normal text-[#5B6470] dark:text-[#9DA5B0]">
                  ({reviews.length})
                </span>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setReviewOpen(true)}>
                {t.sections.writeReview}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <ReviewCard key={rev.id} review={rev} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. CLINIC INFORMATION & DIRECTIONS */}
      <section
        id="clinic"
        className="py-16 lg:py-24 border-b border-black/8 dark:border-white/8 bg-white/40 dark:bg-[#10141A]/35"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          <div>
            <p className="text-xs font-mono font-semibold uppercase tracking-[0.18em] text-[#148F77] dark:text-[#27C2A4]">
              {t.sections.clinicKicker}
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F1419] dark:text-[#F5F7FA] mt-2">
              {t.sections.clinicTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-5 rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div>
                  <p className="text-lg font-bold text-[#0F1419] dark:text-[#F5F7FA]">{clinicName}</p>
                  <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0] mt-1 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#148F77] dark:text-[#27C2A4] shrink-0 mt-0.5" />
                    <span>{clinicAddress}</span>
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-black/6 dark:border-white/6 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#5B6470] dark:text-[#9DA5B0] flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#148F77] dark:text-[#27C2A4]" />
                      {t.common.time}
                    </span>
                    <span className="font-semibold">{clinicHours}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#5B6470] dark:text-[#9DA5B0]">{t.booking.clinicVisit}</span>
                    <span className="font-bold font-mono">
                      {doctor.consultationFeeClinic} {doctor.currency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#5B6470] dark:text-[#9DA5B0]">{t.booking.onlineConsult}</span>
                    <span className="font-bold font-mono">
                      {doctor.consultationFeeOnline} {doctor.currency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#5B6470] dark:text-[#9DA5B0] flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#148F77] dark:text-[#27C2A4]" />
                      WhatsApp
                    </span>
                    <span className="font-mono font-semibold" dir="ltr">
                      {WHATSAPP_DISPLAY}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#148F77] dark:bg-[#27C2A4] text-white dark:text-[#080A0D] text-xs font-semibold hover:opacity-90"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{t.sections.getDirections}</span>
                </a>
                <Link to="/book">
                  <Button variant="secondary" size="md">
                    {t.nav.bookAppointment}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-[#10141A] min-h-[260px]">
                <img
                  src={CLINIC_FACADE_IMAGE}
                  alt={clinicName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-white dark:bg-[#10141A] min-h-[260px] flex flex-col">
                {mapsApiKey ? (
                  <iframe
                    title="Clinic Map"
                    className="w-full flex-1 border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(
                      mapsApiKey
                    )}&q=${doctor.clinicLatitude},${doctor.clinicLongitude}`}
                  />
                ) : (
                  <div className="flex-1 p-6 flex flex-col justify-between bg-editorial-grid relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold text-[#148F77] dark:text-[#27C2A4]">
                        {doctor.clinicLatitude.toFixed(4)}° N, {doctor.clinicLongitude.toFixed(4)}° E
                      </span>
                      <MapPin className="w-5 h-5 text-[#148F77] dark:text-[#27C2A4]" />
                    </div>
                    <div className="space-y-2 my-auto py-6">
                      <p className="text-sm font-bold text-[#0F1419] dark:text-[#F5F7FA]">
                        {clinicName}
                      </p>
                      <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0]">{clinicAddress}</p>
                    </div>
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 h-10 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#151B22] text-xs font-semibold hover:border-[#27C2A4] transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#148F77] dark:text-[#27C2A4]" />
                      <span>{t.sections.getDirections}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. BOOKING CTA & DIRECT CONTACT */}
      <section id="contact" className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-[#10141A] text-[#F5F7FA] p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <p className="text-xs font-mono font-semibold uppercase tracking-[0.18em] text-[#27C2A4]">
                {t.sections.contactKicker}
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-balance">
                {t.sections.ctaTitle}
              </h2>
              <p className="text-sm text-[#9DA5B0] leading-relaxed">{t.sections.ctaDesc}</p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Button
                size="lg"
                onClick={() => {
                  analyticsApi.track('book_click', '/#contact');
                  navigate('/book');
                }}
                leftIcon={<CalendarPlus className="w-4 h-4" />}
              >
                {t.nav.bookAppointment}
              </Button>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => analyticsApi.track('whatsapp_click', '/#contact')}
              >
                <Button variant="whatsapp" size="lg" leftIcon={<MessageCircle className="w-4 h-4" />}>
                  {t.whatsapp.chatCta}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingWhatsAppButton />

      {/* Submit Review Modal */}
      <Modal
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title={t.sections.writeReview}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <Input
            label={t.booking.fullName}
            value={reviewName}
            onChange={(e) => setReviewName(e.target.value)}
            required
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B6470] dark:text-[#9DA5B0]">
              Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setReviewRating(num)}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  <Star
                    className={`w-6 h-6 ${
                      num <= reviewRating
                        ? 'text-[#A58547] dark:text-[#C8A96B] fill-current'
                        : 'text-[#5B6470]/40'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <Textarea
            label="Your Experience"
            rows={4}
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Share how your consultation went..."
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setReviewOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" isLoading={submittingReview}>
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
