import React, { useState } from 'react';
import { Globe, KeyRound, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { DoctorAdminLayout } from '../../components/layout/PortalLayouts';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function AdminSettingsPage() {
  const { changeDoctorAdminPassword } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', undefined, 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', undefined, 'warning');
      return;
    }
    setSaving(true);
    try {
      await changeDoctorAdminPassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Administrator password updated', undefined, 'success');
    } catch (err) {
      showToast('Update failed', err instanceof Error ? err.message : undefined, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DoctorAdminLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold">{t.adminNav.settings}</h1>
          <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0] mt-1">
            Security credentials and interface preferences for the private practice dashboard.
          </p>
        </div>

        {/* Password Change */}
        <form
          onSubmit={handleChangePassword}
          className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 space-y-4"
        >
          <div className="flex items-center gap-2.5 pb-3 border-b border-black/6 dark:border-white/6">
            <KeyRound className="w-4 h-4 text-[#148F77] dark:text-[#27C2A4]" />
            <h2 className="text-base font-bold">Change Administrator Password</h2>
          </div>
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label={t.auth.confirmPassword}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" isLoading={saving}>
              Update Password
            </Button>
          </div>
        </form>

        {/* Preferences */}
        <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/6 dark:border-white/6">
            <div>
              <p className="text-sm font-bold">Theme</p>
              <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0]">
                Switch between Dark Mode and Light Mode.
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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold">Interface Language</p>
              <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0]">
                English (LTR) or Arabic (RTL).
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
        </div>
      </div>
    </DoctorAdminLayout>
  );
}
