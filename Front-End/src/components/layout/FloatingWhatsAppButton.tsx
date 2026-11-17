import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { buildGeneralWhatsAppUrl } from '../../utils/whatsapp';
import { analyticsApi } from '../../api/analyticsApi';

export function FloatingWhatsAppButton() {
  const { language, t } = useLanguage();
  const url = buildGeneralWhatsAppUrl(language);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => analyticsApi.track('whatsapp_click', window.location.pathname)}
      aria-label={t.whatsapp.chatCta}
      className="fixed bottom-5 end-5 z-30 inline-flex items-center gap-2.5 h-12 px-4 rounded-full bg-[#1FAF5A] hover:bg-[#17944A] text-white text-sm font-semibold shadow-lg shadow-black/25 transition-transform hover:-translate-y-0.5"
    >
      <MessageCircle className="w-5 h-5 shrink-0" />
      <span className="hidden sm:inline whitespace-nowrap">{t.whatsapp.chatCta}</span>
    </a>
  );
}
