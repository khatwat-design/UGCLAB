'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { ArrowLeft, Sparkles, LayoutTemplate } from 'lucide-react';

const categories = [
  'تكنولوجيا', 'موضة وجمال', 'طعام وشراب', 'سفر وسياحة',
  'رياضة ولياقة', 'تعليم', 'صحة', 'عقارات', 'سيارات', 'أخرى',
];

const templates = [
  {
    name: 'إطلاق منتج',
    title: 'إطلاق منتج جديد — حملة ترويجية',
    description: 'نبحث عن مبدعين للترويج لمنتجنا الجديد عبر محتوى إبداعي يجذب الجمهور المستهدف. المطلوب مراجعة صادقة وإظهار مميزات المنتج بطريقة طبيعية وجذابة.',
    brief: 'نرحب بأي فكرة إبداعية. المهم هو إظهار قيمة المنتج وفوائده للجمهور. يمكنك اختيار الشكل المناسب لمحتواك.',
    category: 'تكنولوجيا',
  },
  {
    name: 'مراجعة خدمة',
    title: 'مراجعة وتجربة خدمة',
    description: 'نطلب من المبدعين تجربة خدمتنا ومشاركة انطباعهم الصادق مع الجمهور. الهدف هو بناء ثقة ووعي بالعلامة التجارية.',
    brief: 'تجربة حقيقية للخدمة مع ذكر المميزات وسهولة الاستخدام. الحرية الكاملة في أسلوب المحتوى.',
    category: 'أخرى',
  },
  {
    name: 'هدايا ومسابقات',
    title: 'مسابقة هدايا للمتابعين — Giveaway',
    description: 'حملة تفاعلية نهدف من خلالها لزيادة المتابعين والتفاعل. نقدم هدايا قيمة للفائزين عبر قنوات المبدعين.',
    brief: 'الإعلان عن المسابقة وشروط المشاركة وطريقة الفوز. مطلوب فيديو قصير أو بوست تفاعلي.',
    category: 'أخرى',
  },
  {
    name: 'محتوى تعليمي',
    title: 'محتوى تعليمي توعوي',
    description: 'نبحث عن مبدعين لتقديم محتوى تعليمي مبسط يشرح منتجنا أو خدمتنا للجمهور. الهدف هو تثقيف الجمهور بطريقة ممتعة.',
    brief: 'شرح واضح ومبسط مع أمثلة عملية. يمكن استخدام رسومات أو عروض توضيحية.',
    category: 'تعليم',
  },
];

export default function NewCampaign() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '',
    description: '',
    brief: '',
    budget: '',
    category: '',
    max_creators: 1,
    target_gender: '',
    target_age_min: '',
    target_age_max: '',
    videos_per_creator: 1,
    start_date: '',
    end_date: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/advertiser/campaigns', {
        ...form,
        budget: parseFloat(form.budget),
        max_creators: Number(form.max_creators),
        videos_per_creator: Number(form.videos_per_creator),
        target_age_min: form.target_age_min ? Number(form.target_age_min) : undefined,
        target_age_max: form.target_age_max ? Number(form.target_age_max) : undefined,
        target_gender: form.target_gender || undefined,
      });
      toast.success('تم إنشاء الحملة بنجاح');
      router.push(`/advertiser/campaigns/${res.data.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat()[0]
        : err.response?.data?.message || 'حدث خطأ';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Toaster position="top-center" />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-black mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          رجوع
        </button>
        <h1 className="text-xl font-bold text-black">حملة جديدة</h1>
        <p className="text-sm text-gray-400 mt-1">أنشئ حملة إعلانية وابحث عن المبدعين المناسبين</p>
      </motion.div>

      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              s <= step ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              {s}
            </div>
            <div className={`h-0.5 flex-1 transition-colors ${s < step ? 'bg-black' : 'bg-gray-100'}`} />
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <AnimatedStep show={step === 1}>
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                <LayoutTemplate className="w-4 h-4" />
                قالب سريع (اختياري)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {templates.map((t) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => {
                      update('title', t.title);
                      update('description', t.description);
                      update('brief', t.brief);
                      update('category', t.category);
                    }}
                    className="p-3 rounded-xl border border-gray-200 text-xs text-gray-600 hover:border-black hover:text-black hover:bg-gray-50 transition-all text-center"
                  >
                    <div className="font-bold text-black mb-0.5">{t.name}</div>
                    <div className="text-[10px] text-gray-400">{t.category}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">عنوان الحملة</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                className="input-field"
                placeholder="مثال: إعلان ترويجي لمنتج جديد"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">الوصف</label>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                className="input-field min-h-[100px]"
                placeholder="اشرح تفاصيل حملتك وما تهدف لتحقيقه"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">الملخص (Brief)</label>
              <textarea
                value={form.brief}
                onChange={(e) => update('brief', e.target.value)}
                className="input-field min-h-[100px]"
                placeholder="ما الذي تطلبه بالضبط من المبدعين؟"
              />
            </div>
            <div className="flex justify-between pt-2">
              <div />
              <button type="button" onClick={() => setStep(2)} className="btn-primary">
                التالي
              </button>
            </div>
          </div>
        </AnimatedStep>

        <AnimatedStep show={step === 2}>
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">الميزانية ($)</label>
                <input
                  type="number"
                  value={form.budget}
                  onChange={(e) => update('budget', e.target.value)}
                  className="input-field"
                  placeholder="500"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">الفئة</label>
                <select
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                  className="input-field"
                >
                  <option value="">اختر الفئة</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">تاريخ البداية</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => update('start_date', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">تاريخ النهاية</label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => update('end_date', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">عدد المبدعين المطلوب</label>
              <input
                type="number"
                value={form.max_creators}
                onChange={(e) => update('max_creators', parseInt(e.target.value))}
                className="input-field"
                min="1"
                max="100"
              />
            </div>

            <div className="border-t border-gray-100 pt-4 mt-2">
              <h3 className="text-sm font-bold text-black mb-3">الاستهداف الديموغرافي</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">الجنس المستهدف</label>
                  <select
                    value={form.target_gender}
                    onChange={(e) => update('target_gender', e.target.value)}
                    className="input-field"
                  >
                    <option value="">الكل</option>
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                    <option value="any">أي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">الحد الأدنى للعمر</label>
                  <input
                    type="number"
                    value={form.target_age_min}
                    onChange={(e) => update('target_age_min', e.target.value)}
                    className="input-field"
                    placeholder="18"
                    min="13"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">الحد الأقصى للعمر</label>
                  <input
                    type="number"
                    value={form.target_age_max}
                    onChange={(e) => update('target_age_max', e.target.value)}
                    className="input-field"
                    placeholder="35"
                    min="13"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">عدد الفيديوهات لكل مبدع</label>
                  <input
                    type="number"
                    value={form.videos_per_creator}
                    onChange={(e) => update('videos_per_creator', parseInt(e.target.value))}
                    className="input-field"
                    min="1"
                    max="50"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary">السابق</button>
              <button type="button" onClick={() => setStep(3)} className="btn-primary">التالي</button>
            </div>
          </div>
        </AnimatedStep>

        <AnimatedStep show={step === 3}>
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold text-black">مراجعة الحملة</h3>
            </div>

              <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-400">العنوان:</span> <span className="text-black font-medium">{form.title}</span></div>
                  <div><span className="text-gray-400">الفئة:</span> <span className="text-black font-medium">{form.category || '—'}</span></div>
                  <div><span className="text-gray-400">الميزانية:</span> <span className="text-black font-medium">${form.budget}</span></div>
                  <div><span className="text-gray-400">المبدعون:</span> <span className="text-black font-medium">{form.max_creators}</span></div>
                  <div><span className="text-gray-400">الجنس المستهدف:</span> <span className="text-black font-medium">{form.target_gender ? ({ male: 'ذكر', female: 'أنثى', any: 'أي' }[form.target_gender] || 'الكل') : 'الكل'}</span></div>
                  <div><span className="text-gray-400">الفئة العمرية:</span> <span className="text-black font-medium">{form.target_age_min || form.target_age_max ? `${form.target_age_min || '—'} - ${form.target_age_max || '—'}` : 'الكل'}</span></div>
                  <div><span className="text-gray-400">فيديوهات لكل مبدع:</span> <span className="text-black font-medium">{form.videos_per_creator}</span></div>
                </div>
                <p className="text-sm text-gray-600 pt-2 border-t border-gray-200">{form.description}</p>
              </div>

            <div className="flex justify-between pt-2">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary">السابق</button>
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء الحملة'}
              </button>
            </div>
          </div>
        </AnimatedStep>
      </form>
    </div>
  );
}

function AnimatedStep({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={show ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0, 1] }}
      className={show ? 'block' : 'hidden'}
    >
      {children}
    </motion.div>
  );
}
