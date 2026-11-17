import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function AdminLoginPage() {
  const { user, loginDoctorAdmin, changeDoctorAdminPassword, logout } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmNew, setConfirmNew] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // If already logged in as Admin and doesn't need password update, redirect
  React.useEffect(() => {
    if (user?.role === 'Admin' && !user.mustChangePassword) {
      navigate('/doctor-admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const admin = await loginDoctorAdmin(password);
      if (admin.mustChangePassword) {
        showToast(t.auth.changePasswordTitle, t.auth.changePasswordDesc, 'info');
      } else {
        navigate('/doctor-admin/dashboard');
      }
    } catch (err) {
      showToast(
        'Authentication failed',
        err instanceof Error ? err.message : 'Invalid password.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForceChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters.', undefined, 'warning');
      return;
    }
    if (newPassword !== confirmNew) {
      showToast('Passwords do not match.', undefined, 'warning');
      return;
    }
    setUpdatingPassword(true);
    try {
      await changeDoctorAdminPassword(undefined, newPassword);
      showToast('Password updated', 'Welcome to your private clinic dashboard.', 'success');
      navigate('/doctor-admin/dashboard');
    } catch (err) {
      showToast(
        'Could not update password',
        err instanceof Error ? err.message : undefined,
        'error'
      );
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (user?.role === 'Admin' && user.mustChangePassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent text-[#F5F7FA] p-4">
        <div className="max-w-md w-full rounded-3xl border border-white/10 bg-[#10141A] p-8 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#27C2A4]/15 text-[#27C2A4] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold">{t.auth.changePasswordTitle}</h1>
              <p className="text-xs text-[#9DA5B0] mt-0.5">{t.brandName}</p>
            </div>
          </div>
          <p className="text-sm text-[#9DA5B0] leading-relaxed">{t.auth.changePasswordDesc}</p>
          <form onSubmit={handleForceChange} className="space-y-4">
            <Input
              label="New Administrator Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label={t.auth.confirmPassword}
              type="password"
              value={confirmNew}
              onChange={(e) => setConfirmNew(e.target.value)}
              required
            />
            <div className="flex gap-2 pt-2">
              <Button variant="ghost" onClick={logout} className="flex-1">
                {t.common.cancel}
              </Button>
              <Button type="submit" isLoading={updatingPassword} className="flex-1">
                {t.common.save}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent text-[#F5F7FA] p-4">
      <div className="max-w-md w-full rounded-3xl border border-white/10 bg-[#10141A] p-8 space-y-6 shadow-2xl">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9DA5B0] hover:text-[#F5F7FA]"
        >
          <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
          <span>{t.nav.home}</span>
        </Link>

        <div className="space-y-2">
          <div className="w-11 h-11 rounded-2xl bg-[#27C2A4]/15 text-[#27C2A4] flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-extrabold pt-2">{t.auth.adminLoginTitle}</h1>
          <p className="text-sm text-[#9DA5B0]">{t.auth.adminLoginSubtitle}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label={t.auth.password}
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="text-[#9DA5B0] hover:text-white"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            required
          />
          <Button type="submit" size="lg" className="w-full" isLoading={loading}>
            {t.auth.signIn}
          </Button>
        </form>
      </div>
    </div>
  );
}
