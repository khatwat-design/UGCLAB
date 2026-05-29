'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Toaster, toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [step, setStep] = useState<'email' | 'reset' | 'done'>('email');
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setToken(res.data.reset_token || '');
      setStep('reset');
      toast.success('تم إرسال رمز إعادة التعيين');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    } finally { setLoading(false); }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      toast.error('كلمة المرور غير متطابقة');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, token, password, password_confirmation: passwordConfirmation });
      setStep('done');
      toast.success('تم إعادة تعيين كلمة المرور بنجاح');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <Toaster position="top-center" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-4"
      >
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          <Link href="/" className="block mb-6">
            <img src="/logo.svg" alt="UGCLab" className="h-10 w-auto mx-auto" />
          </Link>
          <Link href="/login" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-black mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> العودة لتسجيل الدخول
          </Link>

          {step === 'email' && (
            <>
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                <Mail className="w-5 h-5 text-gray-600" />
              </div>
              <h1 className="text-xl font-bold text-black mb-2">نسيت كلمة المرور؟</h1>
              <p className="text-sm text-gray-500 mb-6">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</p>
              <form onSubmit={handleRequestReset} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="البريد الإلكتروني"
                  required
                />
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
                </button>
              </form>
            </>
          )}

          {step === 'reset' && (
            <>
              <h1 className="text-xl font-bold text-black mb-2">إعادة تعيين كلمة المرور</h1>
              <p className="text-sm text-gray-500 mb-6">أدخل كلمة المرور الجديدة</p>
              <form onSubmit={handleReset} className="space-y-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="كلمة المرور الجديدة"
                  required
                  minLength={8}
                />
                <input
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="input-field"
                  placeholder="تأكيد كلمة المرور"
                  required
                />
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'جاري الحفظ...' : 'إعادة تعيين كلمة المرور'}
                </button>
              </form>
            </>
          )}

          {step === 'done' && (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <h1 className="text-xl font-bold text-black mb-2">تم بنجاح!</h1>
              <p className="text-sm text-gray-500 mb-6">تم إعادة تعيين كلمة المرور بنجاح</p>
              <Link href="/login" className="btn-primary inline-block">تسجيل الدخول</Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
