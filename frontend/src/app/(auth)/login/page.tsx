'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { Toaster, toast } from 'react-hot-toast';

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(email, password);
      const user = useAuthStore.getState().user;
      toast.success('تم تسجيل الدخول بنجاح');

      if (redirectTo) {
        window.location.href = redirectTo;
        return;
      }

      const role = user?.role;
      if (role === 'creator') window.location.href = '/creator';
      else if (role === 'advertiser') window.location.href = '/advertiser';
      else if (role === 'admin') window.location.href = '/admin';
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطأ في تسجيل الدخول');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Toaster position="top-center" />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <img src="/logo.PNG" alt="UGCLab" className="h-10 sm:h-12 w-auto mx-auto" />
          </Link>
          <p className="mt-2 text-sm text-gray-500">تسجيل الدخول إلى حسابك</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="your@email.com"
              required
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
              dir="ltr"
            />
            <div className="flex justify-end mt-1">
              <Link href="/forgot-password" className="text-xs text-gray-400 hover:text-black transition-colors">
                نسيت كلمة المرور؟
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full text-center"
          >
            {isSubmitting ? 'جاري التسجيل...' : 'تسجيل دخول'}
          </button>

          <p className="text-center text-sm text-gray-500">
            ليس لديك حساب؟{' '}
            <Link href="/register" className="text-black font-medium hover:underline">
              إنشاء حساب
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-full max-w-sm mx-auto px-4 space-y-6"><div className="flex justify-center mb-8"><img src="/icon.PNG" alt="UGCLab" className="h-12 w-auto opacity-40 animate-spin-slow" /></div><div className="space-y-4"><div className="h-10 bg-gray-100 rounded-lg animate-pulse" /><div className="h-10 bg-gray-100 rounded-lg animate-pulse" /><div className="h-10 bg-black/10 rounded-lg animate-pulse" /></div></div></div>}>
      <LoginForm />
    </Suspense>
  );
}
