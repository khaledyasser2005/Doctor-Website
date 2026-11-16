import React from 'react';
import { Globe, Moon, Sun } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { PatientLayout } from '../../components/layout/PortalLayouts';
import { Button } from '../../components/ui/Button';

export function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  return (
    <PatientLayout>
      <div className="max-w-3xl space-y-6">
        <h1 className="text-2xl font-extrabold">{t.patientNav.settings}</h1>

        <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/6 dark:border-white/6">
            <div>
              <p className="text-sm font-bold">Appearance</p>
              <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0]">
                Choose dark or light interface theme.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={theme === 'dark' ? 'primary' : 'secondary'}
                size="sm"
                leftIcon={<Moon className="w-3.5 h-3.5" />}
                onClick={() => setTheme('dark')}
              >
                Dark
              </Button>
              <Button
                variant={theme === 'light' ? 'primary' : 'secondary'}
                size="sm"
                leftIcon={<Sun className="w-3.5 h-3.5" />}
                onClick={() => setTheme('light')}
              >
                Light
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/6 dark:border-white/6">
            <div>
              <p className="text-sm font-bold">Language</p>
              <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0]">
                Switch seamlessly between English (LTR) and Arabic (RTL).
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={language === 'en' ? 'primary' : 'secondary'}
                size="sm"
                leftIcon={<Globe className="w-3.5 h-3.5" />}
                onClick={() => setLanguage('en')}
              >
                English
              </Button>
              <Button
                variant={language === 'ar' ? 'primary' : 'secondary'}
                size="sm"
                leftIcon={<Globe className="w-3.5 h-3.5" />}
                onClick={() => setLanguage('ar')}
              >
                العربية
              </Button>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#5B6470] dark:text-[#9DA5B0]">
              Account
            </p>
            <p className="text-sm font-semibold mt-1">{user?.email}</p>
            <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0]">
              Sign-in provider: {user?.authProvider === 'google' ? 'Google OAuth' : 'Email & Password'}
            </p>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}
