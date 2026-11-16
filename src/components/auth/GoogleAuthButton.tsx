import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { AlertCircle, Loader2 } from 'lucide-react';
import { auth, googleProvider } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

export function GoogleAuthButton({ onSuccess }: { onSuccess?: () => void }) {
  const { loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const idToken = await credential.user.getIdToken();
      await loginWithGoogle(idToken);
      showToast(
        language === 'ar' ? 'تم تسجيل الدخول بحساب Google بنجاح' : 'Signed in with Google',
        credential.user.email || undefined,
        'success'
      );
      onSuccess?.();
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      let message: string;
      if (code === 'auth/popup-blocked') {
        message =
          language === 'ar'
            ? 'قام المتصفح بحظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة ثم المحاولة مرة أخرى.'
            : 'Pop-up was blocked by your browser. Please allow pop-ups and try again.';
      } else if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        message =
          language === 'ar'
            ? 'تم إغلاق نافذة تسجيل الدخول قبل إتمام العملية.'
            : 'Google Sign-In popup was closed before completing.';
      } else if (code === 'auth/unauthorized-domain') {
        message =
          language === 'ar'
            ? 'النطاق الحالي غير مصرح به في إعدادات Firebase Auth.'
            : 'This domain is not authorized in Firebase Authentication settings.';
      } else {
        message =
          err instanceof Error
            ? err.message
            : language === 'ar'
            ? 'تعذر إتمام تسجيل الدخول بحساب Google.'
            : 'Unable to complete Google Sign-In.';
      }
      setErrorMsg(message);
      showToast(
        language === 'ar' ? 'فشل تسجيل الدخول بحساب Google' : 'Google Sign-In failed',
        message,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2.5">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full h-11 rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#151B22] hover:bg-black/3 dark:hover:bg-white/5 text-sm font-semibold text-[#0F1419] dark:text-[#F5F7FA] flex items-center justify-center gap-2.5 cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#27C2A4]" />
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.52 12.27c0-.82-.07-1.64-.22-2.43H12v4.61h6.46c-.27 1.48-1.12 2.75-2.38 3.59v2.98h3.85c2.26-2.08 3.59-5.15 3.59-8.75z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.85-2.98c-1.07.72-2.45 1.15-4.09 1.15-3.14 0-5.81-2.12-6.76-4.97H1.26v3.08C3.28 21.38 7.36 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.24 14.29A7.18 7.18 0 0 1 4.86 12c0-.79.14-1.56.38-2.29V6.63H1.26A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.26 5.37l3.98-3.08z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.59 1.8l3.44-3.44C17.95 1.19 15.23 0 12 0 7.36 0 3.28 2.62 1.26 6.63l3.98 3.08C6.19 6.87 8.86 4.75 12 4.75z"
            />
          </svg>
        )}
        <span>
          {loading
            ? language === 'ar'
              ? 'جاري تسجيل الدخول...'
              : 'Signing in...'
            : t.auth.continueWithGoogle}
        </span>
      </button>

      {errorMsg && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
