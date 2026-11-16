import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { CLINIC_ADDRESS_AR, CLINIC_ADDRESS_EN, WHATSAPP_DISPLAY } from '../../utils/constants';
import { buildGeneralWhatsAppUrl } from '../../utils/whatsapp';
import { analyticsApi } from '../../api/analyticsApi';

export function Footer() {
  const { language, t } = useLanguage();
  const waUrl = buildGeneralWhatsAppUrl(language);

  return (
    <footer className="border-t border-black/8 dark:border-white/8 bg-[#F0F2F1] dark:bg-[#080A0D] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-2.5">
          <div>
            <p className="text-lg font-extrabold tracking-tight text-[#0F1419] dark:text-[#F5F7FA]">
              {t.brandName}
            </p>
            <p className="text-xs font-medium text-[#5B6470] dark:text-[#9DA5B0]">{t.brandSubtitle}</p>
          </div>
          <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0] leading-relaxed max-w-xs">
            {t.footer.privacyNote}
          </p>
        </div>

        <div className="space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#5B6470] dark:text-[#9DA5B0]">
            {t.nav.clinic}
          </p>
          <div className="space-y-2 text-sm text-[#0F1419] dark:text-[#F5F7FA]">
            <div className="flex items-center gap-2 text-[#5B6470] dark:text-[#9DA5B0]">
              <MapPin className="w-4 h-4 text-[#148F77] dark:text-[#27C2A4] shrink-0" />
              <span>{language === 'ar' ? CLINIC_ADDRESS_AR : CLINIC_ADDRESS_EN}</span>
            </div>
            <div className="flex items-center gap-2 text-[#5B6470] dark:text-[#9DA5B0]">
              <Phone className="w-4 h-4 text-[#148F77] dark:text-[#27C2A4] shrink-0" />
              <span className="tabular-nums" dir="ltr">
                {WHATSAPP_DISPLAY}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#5B6470] dark:text-[#9DA5B0]">
            {t.nav.contact}
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/book"
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-[#148F77] dark:bg-[#27C2A4] text-white dark:text-[#080A0D] text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>{t.nav.bookAppointment}</span>
            </Link>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => analyticsApi.track('whatsapp_click', '/footer')}
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#10141A] text-xs font-semibold text-[#0F1419] dark:text-[#F5F7FA] hover:border-[#1FAF5A] transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#1FAF5A]" />
              <span>{t.whatsapp.chatCta}</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 pt-6 border-t border-black/6 dark:border-white/6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#5B6470] dark:text-[#9DA5B0]">
        <p>© {new Date().getFullYear()} {t.footer.rights}</p>
        <div className="flex items-center gap-4">
          <Link to="/doctor" className="hover:text-[#0F1419] dark:hover:text-[#F5F7FA]">
            {t.hero.secondaryCta}
          </Link>
          <Link to="/login" className="hover:text-[#0F1419] dark:hover:text-[#F5F7FA]">
            {t.nav.portal}
          </Link>
        </div>
      </div>
    </footer>
  );
}
