import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Lock, Mail, Phone, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../api/authApi';
import { CLINIC_SUITE_IMAGE, DOCTOR_PORTRAIT_URL } from '../../utils/constants';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';

function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-transparent text-[#0F1419] dark:text-[#F5F7FA] grid grid-cols-1 lg:grid-cols-12">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:col-span-5 relative overflow-hidden bg-[#10141A] text-[#F5F7FA] p-10 flex-col justify-between border-e border-white/8">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${CLINIC_SUITE_IMAGE})` }}
        />
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="font-extrabold text-lg tracking-tight">
            {t.brandName}
          </Link>
          <span className="text-xs font-mono text-[#27C2A4]">{t.brandSubtitle}</span>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <img
            src={DOCTOR_PORTRAIT_URL}
            alt={t.brandName}
            className="w-16 h-16 rounded-2xl object-cover object-top border border-white/15"
          />
          <div>
            <p className="text-lg font-bold">{t.brandName}</p>
            <p className="text-xs text-[#9DA5B0]">{t.footer.privacyNote}</p>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B6470] dark:text-[#9DA5B0] hover:text-[#0F1419] dark:hover:text-[#F5F7FA]"
          >
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
            <span>{t.nav.home}</span>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">{title}</h1>
            <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0] mt-1.5">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const { loginPatient } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginPatient(email, password);
      showToast('Welcome back', undefined, 'success');
      navigate('/patient/home');
    } catch (err) {
      showToast('Sign in failed', err instanceof Error ? err.message : undefined, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title={t.auth.loginTitle} subtitle={t.auth.loginSubtitle}>
      <GoogleAuthButton onSuccess={() => navigate('/patient/home')} />

      <div className="relative flex items-center justify-center">
        <div className="border-t border-black/10 dark:border-white/10 w-full" />
        <span className="px-3 text-xs text-[#5B6470] dark:text-[#9DA5B0] bg-[#F6F7F5] dark:bg-[#080A0D] whitespace-nowrap">
          {t.auth.orEmail}
        </span>
        <div className="border-t border-black/10 dark:border-white/10 w-full" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t.auth.email}
          type="email"
          leftIcon={<Mail className="w-4 h-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label={t.auth.password}
          type={showPass ? 'text' : 'password'}
          leftIcon={<Lock className="w-4 h-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              className="text-[#5B6470] dark:text-[#9DA5B0]"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          required
        />
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-xs font-semibold text-[#148F77] dark:text-[#27C2A4] hover:underline"
          >
            {t.auth.forgotPassword}
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full" isLoading={loading}>
          {t.auth.signIn}
        </Button>
      </form>

      <p className="text-center text-xs text-[#5B6470] dark:text-[#9DA5B0]">
        {t.auth.noAccount}{' '}
        <Link to="/register" className="font-semibold text-[#148F77] dark:text-[#27C2A4] hover:underline">
          {t.auth.createAccount}
        </Link>
      </p>
    </AuthShell>
  );
}

export function RegisterPage() {
  const { registerPatient } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      showToast('Passwords do not match', undefined, 'warning');
      return;
    }
    setLoading(true);
    try {
      await registerPatient({ fullName, email, phone, password });
      showToast('Account created', undefined, 'success');
      navigate('/patient/home');
    } catch (err) {
      showToast('Registration failed', err instanceof Error ? err.message : undefined, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title={t.auth.registerTitle} subtitle={t.auth.registerSubtitle}>
      <GoogleAuthButton onSuccess={() => navigate('/patient/home')} />

      <div className="relative flex items-center justify-center">
        <div className="border-t border-black/10 dark:border-white/10 w-full" />
        <span className="px-3 text-xs text-[#5B6470] dark:text-[#9DA5B0] bg-[#F6F7F5] dark:bg-[#080A0D] whitespace-nowrap">
          {t.auth.orEmail}
        </span>
        <div className="border-t border-black/10 dark:border-white/10 w-full" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t.auth.fullName}
          leftIcon={<UserIcon className="w-4 h-4" />}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <Input
          label={t.auth.phone}
          leftIcon={<Phone className="w-4 h-4" />}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <Input
          label={t.auth.email}
          type="email"
          leftIcon={<Mail className="w-4 h-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={t.auth.password}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label={t.auth.confirmPassword}
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
        <Button type="submit" size="lg" className="w-full" isLoading={loading}>
          {t.auth.createAccount}
        </Button>
      </form>

      <p className="text-center text-xs text-[#5B6470] dark:text-[#9DA5B0]">
        {t.auth.haveAccount}{' '}
        <Link to="/login" className="font-semibold text-[#148F77] dark:text-[#27C2A4] hover:underline">
          {t.auth.signIn}
        </Link>
      </p>
    </AuthShell>
  );
}

export function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset Password"
      subtitle="Enter your registered patient email to receive reset instructions."
    >
      {sent ? (
        <div className="rounded-2xl border border-[#148F77]/25 bg-[#148F77]/8 p-6 space-y-3">
          <CheckCircle2 className="w-6 h-6 text-[#148F77] dark:text-[#27C2A4]" />
          <p className="text-sm font-semibold">Reset instructions processed</p>
          <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0]">
            If an account matches <strong>{email}</strong>, a password reset link has been prepared.
          </p>
          <Link to="/login" className="inline-block text-xs font-semibold text-[#148F77] dark:text-[#27C2A4]">
            Return to {t.auth.signIn}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t.auth.email}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" isLoading={loading}>
            Send Reset Instructions
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const token = params.get('token') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword: password });
      showToast('Password updated', undefined, 'success');
      navigate('/login');
    } catch (err) {
      showToast('Reset failed', err instanceof Error ? err.message : undefined, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Set New Password" subtitle="Choose a secure password for your patient portal.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" isLoading={loading}>
          Update Password
        </Button>
      </form>
    </AuthShell>
  );
}

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [status, setStatus] = useState<'idle' | 'verified' | 'error'>('idle');

  React.useEffect(() => {
    if (!token) return;
    authApi
      .verifyEmail(token)
      .then(() => setStatus('verified'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <AuthShell title="Email Verification" subtitle="Confirming your patient account email.">
      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#10141A] p-6 space-y-3">
        {status === 'verified' ? (
          <>
            <p className="text-sm font-bold text-[#148F77] dark:text-[#27C2A4]">
              Your email has been verified.
            </p>
            <Link to="/patient/home">
              <Button size="sm">Open Patient Portal</Button>
            </Link>
          </>
        ) : status === 'error' ? (
          <p className="text-sm text-red-500">Verification token is invalid or expired.</p>
        ) : (
          <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0]">
            Ready to verify your account when opened with a valid confirmation link.
          </p>
        )}
      </div>
    </AuthShell>
  );
}
