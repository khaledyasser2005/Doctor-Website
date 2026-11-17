import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CalendarPlus, Globe, Menu, Moon, ShieldCheck, Sun, User as UserIcon, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { analyticsApi } from '../../api/analyticsApi';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';

export function PublicNavbar() {
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sectionLinks = [
    { label: t.nav.home, target: 'hero' },
    { label: t.nav.about, target: 'about' },
    { label: t.nav.specialization, target: 'specialization' },
    { label: t.nav.certificates, target: 'certificates' },
    { label: t.nav.reviews, target: 'reviews' },
    { label: t.nav.clinic, target: 'clinic' },
    { label: t.nav.contact, target: 'contact' },
  ];

  const handleNavClick = (sectionId: string) => {
    setMobileOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 120);
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBookClick = () => {
    analyticsApi.track('book_click', location.pathname);
    setMobileOpen(false);
    navigate('/book');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-black/8 dark:border-white/8 bg-[#F6F7F5]/90 dark:bg-[#080A0D]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Lockup */}
        <Link
          to="/"
          className="flex flex-col leading-none shrink-0 group focus-visible:outline-none"
        >
          <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#0F1419] dark:text-[#F5F7FA] group-hover:text-[#148F77] dark:group-hover:text-[#27C2A4] transition-colors whitespace-nowrap">
            {t.brandName}
          </span>
          <span className="text-[11px] font-medium tracking-wide text-[#5B6470] dark:text-[#9DA5B0] mt-0.5 whitespace-nowrap">
            {t.brandSubtitle}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-5" aria-label="Main navigation">
          {sectionLinks.map((item) => (
            <button
              key={item.target}
              type="button"
              onClick={() => handleNavClick(item.target)}
              className="text-sm font-medium text-[#5B6470] dark:text-[#9DA5B0] hover:text-[#0F1419] dark:hover:text-[#F5F7FA] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleLanguage}
            className="h-9 px-2.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-semibold text-[#5B6470] dark:text-[#9DA5B0] hover:text-[#0F1419] dark:hover:text-[#F5F7FA] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            aria-label="Switch language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'AR' : 'EN'}</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl border border-black/10 dark:border-white/10 text-[#5B6470] dark:text-[#9DA5B0] hover:text-[#0F1419] dark:hover:text-[#F5F7FA] hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user && user.role === 'Patient' ? (
            <Link
              to="/patient/home"
              className="hidden sm:flex items-center gap-2 h-9 ps-1.5 pe-3 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <Avatar src={user.avatarUrl} name={user.fullName} size="sm" />
              <span className="text-xs font-semibold text-[#0F1419] dark:text-[#F5F7FA] whitespace-nowrap max-w-[110px] truncate">
                {user.fullName}
              </span>
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5">
              <Link
                to="/login"
                className="h-9 px-3 rounded-xl text-xs font-semibold text-[#5B6470] dark:text-[#9DA5B0] hover:text-[#0F1419] dark:hover:text-[#F5F7FA] flex items-center whitespace-nowrap"
              >
                {t.nav.login}
              </Link>
              <Link
                to="/register"
                className="h-9 px-3 rounded-xl border border-black/10 dark:border-white/10 text-xs font-semibold text-[#0F1419] dark:text-[#F5F7FA] hover:bg-black/5 dark:hover:bg-white/5 flex items-center whitespace-nowrap"
              >
                {t.nav.createAccount}
              </Link>
            </div>
          )}

          <Link
            to={user?.role === 'Admin' ? '/doctor-admin/dashboard' : '/doctor-admin/login'}
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-[#C8A96B]/40 bg-[#C8A96B]/10 hover:bg-[#C8A96B]/20 text-xs font-bold text-[#8E6F36] dark:text-[#E5C98B] transition-colors whitespace-nowrap shrink-0"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t.nav.admin}</span>
          </Link>

          <Button
            size="sm"
            onClick={handleBookClick}
            leftIcon={<CalendarPlus className="w-3.5 h-3.5" />}
            className="hidden sm:inline-flex"
          >
            {t.nav.bookAppointment}
          </Button>

          <button
            type="button"
            onClick={() => setMobileOpen((p) => !p)}
            className="lg:hidden w-9 h-9 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center text-[#0F1419] dark:text-[#F5F7FA]"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {sectionLinks.map((item) => (
              <button
                key={item.target}
                type="button"
                onClick={() => handleNavClick(item.target)}
                className="text-start px-3 py-2 rounded-xl text-sm font-medium text-[#0F1419] dark:text-[#F5F7FA] hover:bg-black/5 dark:hover:bg-white/5"
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="pt-2 border-t border-black/8 dark:border-white/8 flex flex-col gap-2">
            <Button onClick={handleBookClick} leftIcon={<CalendarPlus className="w-4 h-4" />}>
              {t.nav.bookAppointment}
            </Button>
            {user && user.role === 'Patient' ? (
              <Link
                to="/patient/home"
                onClick={() => setMobileOpen(false)}
                className="h-10 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center gap-2 text-sm font-semibold text-[#0F1419] dark:text-[#F5F7FA]"
              >
                <UserIcon className="w-4 h-4" />
                <span>{t.nav.portal}</span>
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="h-10 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center text-sm font-semibold text-[#0F1419] dark:text-[#F5F7FA]"
                >
                  {t.nav.login}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="h-10 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center text-sm font-semibold text-[#0F1419] dark:text-[#F5F7FA]"
                >
                  {t.nav.createAccount}
                </Link>
              </div>
            )}
            <Link
              to={user?.role === 'Admin' ? '/doctor-admin/dashboard' : '/doctor-admin/login'}
              onClick={() => setMobileOpen(false)}
              className="h-10 rounded-xl border border-[#C8A96B]/40 bg-[#C8A96B]/10 flex items-center justify-center gap-2 text-sm font-bold text-[#8E6F36] dark:text-[#E5C98B]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t.nav.admin}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
