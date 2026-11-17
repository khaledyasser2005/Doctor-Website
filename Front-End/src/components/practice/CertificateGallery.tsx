import React, { useState } from 'react';
import { Award, Download, Maximize2, X, ZoomIn, ZoomOut } from 'lucide-react';
import { Certificate } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export function CertificateGallery({ certificates }: { certificates: Certificate[] }) {
  const { language, t } = useLanguage();
  const [selected, setSelected] = useState<Certificate | null>(null);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);

  const openModal = (cert: Certificate) => {
    setZoom(1);
    setFullscreen(false);
    setSelected(cert);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => {
          const title = language === 'ar' ? cert.titleAr : cert.title;
          const inst = language === 'ar' ? cert.institutionAr : cert.institution;
          const desc = language === 'ar' ? cert.descriptionAr : cert.description;

          return (
            <button
              key={cert.id}
              type="button"
              onClick={() => openModal(cert)}
              className="group text-start rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] overflow-hidden transition-all hover:border-[#148F77]/40 dark:hover:border-[#27C2A4]/40 hover:-translate-y-0.5 cursor-pointer flex flex-col"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F0F2F1] dark:bg-[#151B22]">
                <img
                  src={cert.imageUrl}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-60" />
                <span className="absolute bottom-3 start-3 inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-white/95">
                  <Award className="w-3.5 h-3.5 text-[#27C2A4]" />
                  {cert.date}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h3 className="text-base font-bold text-[#0F1419] dark:text-[#F5F7FA] group-hover:text-[#148F77] dark:group-hover:text-[#27C2A4] transition-colors">
                    {title}
                  </h3>
                  <p className="text-xs font-semibold text-[#148F77] dark:text-[#27C2A4] mt-1">
                    {inst}
                  </p>
                </div>
                {desc && (
                  <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0] line-clamp-2 leading-relaxed">
                    {desc}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Certificate Lightbox Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className={`${
              fullscreen ? 'w-full h-full' : 'max-w-4xl w-full max-h-[90vh]'
            } rounded-2xl border border-white/10 bg-[#10141A] text-[#F5F7FA] flex flex-col overflow-hidden transition-all`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">
                  {language === 'ar' ? selected.titleAr : selected.title}
                </p>
                <p className="text-xs text-[#9DA5B0] truncate">
                  {language === 'ar' ? selected.institutionAr : selected.institution} · {selected.date}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono w-11 text-center">{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(2.25, z + 0.25))}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setFullscreen((f) => !f)}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center"
                  aria-label="Toggle fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                {selected.allowDownload && (
                  <a
                    href={selected.imageUrl}
                    download={`certificate-${selected.id}.jpg`}
                    className="h-8 px-3 rounded-lg bg-[#27C2A4] text-[#080A0D] text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t.common.download}</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center"
                  aria-label="Close certificate preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-[#080A0D]">
              <img
                src={selected.imageUrl}
                alt={language === 'ar' ? selected.titleAr : selected.title}
                style={{ transform: `scale(${zoom})` }}
                className="max-h-full max-w-full object-contain rounded-lg transition-transform duration-150"
              />
            </div>

            {(selected.description || selected.descriptionAr) && (
              <div className="px-5 py-3 border-t border-white/10 text-xs text-[#9DA5B0]">
                {language === 'ar' ? selected.descriptionAr : selected.description}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
