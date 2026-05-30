'use client';

import { Suspense, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { CREATOR_CATEGORIES, ADVERTISER_INDUSTRIES, IRAQI_GOVERNORATES } from '@/lib/constants';
import {
  ChevronLeft, ChevronRight, Upload, X, CheckCircle, FileText,
  User, Building2, Camera, Film, Tv, Globe as GlobeIcon,
} from 'lucide-react';

const steps = [
  { id: 'role', label: 'نوع الحساب' },
  { id: 'info', label: 'المعلومات الأساسية' },
  { id: 'profile', label: 'الملف الشخصي' },
  { id: 'docs', label: 'الوثائق' },
];

const platformOptions = [
  { value: 'instagram', label: 'Instagram', icon: Camera },
  { value: 'youtube', label: 'YouTube', icon: Film },
  { value: 'tiktok', label: 'TikTok', icon: Tv },
  { value: 'twitter', label: 'X (Twitter)', icon: GlobeIcon },
  { value: 'snapchat', label: 'Snapchat', icon: Tv },
];

function RegisterWizard() {
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') || '';
  const { register } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [role, setRole] = useState(defaultRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+964');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  // Creator fields
  const [category, setCategory] = useState('');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [followersCount, setFollowersCount] = useState('');
  const [engagementRate, setEngagementRate] = useState('');
  const [portfolioLinks, setPortfolioLinks] = useState('');
  const [bio, setBio] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  // Advertiser fields
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');

  // Document upload
  const [documents, setDocuments] = useState<{ type: string; file: File; name: string }[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docType, setDocType] = useState('id_card');
  const [uploadedDocIds, setUploadedDocIds] = useState<number[]>([]);

  const canNext = () => {
    if (step === 0) return !!role;
    if (step === 1) return !!name && !!email && !!phone && !!password && password === passwordConfirmation && password.length >= 8;
    if (step === 2) {
      if (role === 'creator') return true;
      return !!companyName;
    }
    return true;
  };

  const handleRegister = async () => {
    setIsSubmitting(true);
    try {
      await register(name, email, password, passwordConfirmation, role, {
        phone: `${countryCode}${phone}`,
        ...(role === 'creator' ? {
          category,
          platforms,
          followers_count: parseInt(followersCount) || 0,
          engagement_rate: parseFloat(engagementRate) || 0,
          bio,
          address,
          city,
          state,
          country: 'IQ',
          portfolio_links: portfolioLinks ? portfolioLinks.split('\n').map(s => s.trim()).filter(Boolean) : [],
        } : {
          company_name: companyName,
          industry,
          company_website: companyWebsite,
        }),
      });
      // Upload documents after registration (token is now available)
      if (documents.length > 0) {
        await uploadDocsAfterRegister();
      }
      toast.success('تم إنشاء الحساب بنجاح');
      setRegistered(true);
    } catch (err: any) {
      const messages = err.response?.data?.errors;
      if (messages) {
        const firstError = Object.values(messages)[0] as string[];
        toast.error(firstError?.[0] || 'خطأ في إنشاء الحساب');
      } else {
        toast.error(err.response?.data?.message || 'خطأ في إنشاء الحساب');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadDoc = async () => {
    if (!fileInputRef.current?.files?.[0]) return;
    const file = fileInputRef.current.files[0];
    setDocuments(prev => [...prev, { type: docType, file, name: file.name }]);
    fileInputRef.current.value = '';
  };

  const removeDoc = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const uploadDocsAfterRegister = async () => {
    setUploadingDoc(true);
    try {
      for (const doc of documents) {
        const formData = new FormData();
        formData.append('document_type', doc.type);
        formData.append('file', doc.file);
        await api.post('/kyc/upload', formData);
      }
    } catch (err: any) {
      const serverMsg = err.response?.data?.message;
      const errorMsg = serverMsg || 'فشل رفع بعض الوثائق، يمكنك رفعها لاحقاً من الإعدادات';
      toast.error(errorMsg);
      if (err.response?.data?.errors) {
        console.error('Upload validation errors:', err.response.data.errors);
      }
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSubmit = () => {
    handleRegister();
  };

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-black mb-2">تم إنشاء الحساب بنجاح!</h2>
          <p className="text-sm text-gray-500 mb-6">
            {documents.length > 0
              ? 'سيتم مراجعة وثائقك من قبل فريق الإدارة. سنعلمك عند اكتمال التوثيق.'
              : 'يمكنك الآن البدء في استخدام المنصة.'}
          </p>
          <Link
            href={role === 'creator' ? '/creator' : '/advertiser'}
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all"
          >
            ابدأ الآن
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Toaster position="top-center" />
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <img src="/logo.PNG" alt="UGCLab" className="h-10 sm:h-12 w-auto mx-auto" />
          </Link>
          <p className="mt-2 text-sm text-gray-500">إنشاء حساب جديد</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                i < step ? 'bg-black text-white' : i === step ? 'bg-black text-white ring-2 ring-gray-300' : 'bg-gray-100 text-gray-400'
              }`}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 sm:w-20 h-0.5 mx-1 transition-colors ${i < step ? 'bg-black' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 mb-6 -mt-4">
          {steps.map(s => <span key={s.id}>{s.label}</span>)}
        </div>

        <div className="card">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.15 }}
            >
              {/* Step 0: Role */}
              {step === 0 && (
                <div className="space-y-5">
                  <h2 className="text-lg font-bold text-black">اختر نوع الحساب</h2>
                  <p className="text-sm text-gray-500">اختر نوع الحساب الذي تريد إنشاءه</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setRole('creator')}
                      className={`p-6 rounded-xl border-2 text-center transition-all ${
                        role === 'creator'
                          ? 'border-black bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Camera className="w-8 h-8 mx-auto mb-3 text-gray-600" />
                      <p className="font-bold text-black text-sm">مبدع محتوى</p>
                      <p className="text-xs text-gray-400 mt-1">اصنع محتوى واربح</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('advertiser')}
                      className={`p-6 rounded-xl border-2 text-center transition-all ${
                        role === 'advertiser'
                          ? 'border-black bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Building2 className="w-8 h-8 mx-auto mb-3 text-gray-600" />
                      <p className="font-bold text-black text-sm">معلن</p>
                      <p className="text-xs text-gray-400 mt-1">سوق لمنتجك أو خدمتك</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-black">المعلومات الأساسية</h2>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">الاسم الكامل</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="الاسم الكامل" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="your@email.com" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      رقم الهاتف <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-[1fr_120px] gap-2">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className="input-field"
                        placeholder="xxx xxx xxxx"
                        required
                        dir="ltr"
                      />
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="input-field text-center"
                        dir="ltr"
                      >
                        <option value="+964">🇮🇶 +964</option>
                        <option value="+966">🇸🇦 +966</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+965">🇰🇼 +965</option>
                        <option value="+973">🇧🇭 +973</option>
                        <option value="+974">🇶🇦 +974</option>
                        <option value="+968">🇴🇲 +968</option>
                        <option value="+20">🇪🇬 +20</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">كلمة المرور</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="••••••••" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">تأكيد كلمة المرور</label>
                    <input type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} className="input-field" placeholder="••••••••" dir="ltr" />
                  </div>
                </div>
              )}

              {/* Step 2: Profile */}
              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-black">
                    {role === 'creator' ? 'الملف الشخصي للمبدع' : 'معلومات الشركة'}
                  </h2>

                  {role === 'creator' ? (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">التصنيف</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
                          <option value="">اختر التصنيف</option>
                          {CREATOR_CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">نبذة عنك</label>
                        <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="input-field min-h-[80px]" placeholder="اكتب نبذة تعريفية عنك وعن محتواك" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">عدد المتابعين</label>
                          <input type="number" value={followersCount} onChange={(e) => setFollowersCount(e.target.value)} className="input-field" placeholder="0" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">معدل التفاعل %</label>
                          <input type="number" step="0.1" value={engagementRate} onChange={(e) => setEngagementRate(e.target.value)} className="input-field" placeholder="0" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">المنصات</label>
                        <div className="flex flex-wrap gap-2">
                          {platformOptions.map((p) => {
                            const Icon = p.icon;
                            const selected = platforms.includes(p.value);
                            return (
                              <button
                                key={p.value}
                                type="button"
                                onClick={() => setPlatforms(prev =>
                                  selected ? prev.filter(x => x !== p.value) : [...prev, p.value]
                                )}
                                className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm border transition-all ${
                                  selected
                                    ? 'bg-black text-white border-black'
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                                {p.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">روابط الأعمال (رابط في كل سطر)</label>
                        <textarea value={portfolioLinks} onChange={(e) => setPortfolioLinks(e.target.value)} className="input-field min-h-[80px]" placeholder="https://instagram.com/p/...&#10;https://youtube.com/..." dir="ltr" />
                      </div>

                      <div className="border-t border-gray-100 pt-4 mt-2">
                        <h3 className="text-sm font-bold text-black mb-3">العنوان (لشحن المنتجات)</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">العنوان</label>
                            <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="input-field min-h-[60px]" placeholder="العنوان الكامل..." />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">المحافظة</label>
                            <select value={state} onChange={(e) => { setState(e.target.value); setCity(''); }} className="input-field">
                              <option value="">اختر المحافظة</option>
                              {Object.keys(IRAQI_GOVERNORATES).map((gov) => (
                                <option key={gov} value={gov}>{gov}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">المدينة</label>
                            <select value={city} onChange={(e) => setCity(e.target.value)} className="input-field" disabled={!state}>
                              <option value="">اختر المدينة</option>
                              {state && IRAQI_GOVERNORATES[state]?.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2">هذا العنوان سيتم إرساله للمعلن عند الموافقة على طلبك لشحن المنتجات</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">اسم الشركة</label>
                        <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="input-field" placeholder="اسم الشركة أو المؤسسة" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">المجال</label>
                        <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="input-field">
                          <option value="">اختر المجال</option>
                          {ADVERTISER_INDUSTRIES.map((ind) => (
                            <option key={ind} value={ind}>{ind}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">الموقع الإلكتروني</label>
                        <input type="url" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} className="input-field" placeholder="https://example.com" dir="ltr" />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 3: Documents */}
              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-black">التحقق من الهوية</h2>
                  <p className="text-sm text-gray-500">
                    قم برفع وثائق التحقق من الهوية لتوثيق حسابك. هذا يساعد في بناء الثقة مع المعلنين/المبدعين.
                  </p>

                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <select value={docType} onChange={(e) => setDocType(e.target.value)} className="input-field flex-1 text-sm">
                        <option value="id_card">بطاقة هوية</option>
                        <option value="passport">جواز سفر</option>
                        {role === 'advertiser' && <option value="business_license">سجل تجاري</option>}
                        <option value="portfolio">أعمال سابقة</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-primary text-sm shrink-0"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                        className="hidden"
                        onChange={handleUploadDoc}
                      />
                    </div>

                    {documents.length > 0 && (
                      <div className="space-y-2">
                        {documents.map((doc, i) => (
                          <div key={i} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                              <span className="text-xs text-gray-600 truncate">{doc.name}</span>
                              <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                {doc.type === 'id_card' ? 'هوية' : doc.type === 'passport' ? 'جواز' : doc.type === 'business_license' ? 'سجل تجاري' : 'أعمال'}
                              </span>
                            </div>
                            <button onClick={() => removeDoc(i)} className="text-gray-400 hover:text-red-500 shrink-0">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-[10px] text-gray-400">
                      الصيغ المدعومة: JPG, PNG, PDF - الحجم الأقصى: 10MB
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            {step > 0 ? (
              <button onClick={() => setStep(prev => prev - 1)} className="btn-secondary inline-flex items-center gap-1">
                <ChevronRight className="w-4 h-4" /> السابق
              </button>
            ) : (
              <div />
            )}

            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(prev => prev + 1)}
                disabled={!canNext()}
                className="btn-primary inline-flex items-center gap-1 disabled:opacity-50"
              >
                التالي <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || uploadingDoc}
                className="btn-primary inline-flex items-center gap-1 disabled:opacity-50"
              >
                {isSubmitting ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          <p className="text-center text-xs text-gray-500 mt-4">
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="text-black font-medium hover:underline">تسجيل دخول</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><img src="/icon.PNG" alt="loading" className="h-10 w-auto opacity-40 animate-spin-slow" /></div>}>
      <RegisterWizard />
    </Suspense>
  );
}
