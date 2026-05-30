'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { User, Building2, Search, Send, CheckCircle, DollarSign } from 'lucide-react';

interface Step {
  icon: any;
  step: string;
  title: string;
  desc: string;
}

const creatorSteps: Step[] = [
  { icon: User, step: '١', title: 'أنشئ حسابك', desc: 'سجل كمبدع محتوى واملأ ملفك الشخصي بمهاراتك وأعمالك السابقة.' },
  { icon: Search, step: '٢', title: 'ابحث عن حملات', desc: 'تصفح الحملات المتاحة وابحث عن الفرص التي تناسب تخصصك.' },
  { icon: Send, step: '٣', title: 'قدم طلبك', desc: 'أرسل عرضك مع نبذة عن فكرتك والسعر المناسب للمعلن.' },
  { icon: CheckCircle, step: '٤', title: 'نفذ واستلم', desc: 'بعد الموافقة، نفذ المحتوى واحصل على تقييمك واستلم أرباحك.' },
];

const advertiserSteps: Step[] = [
  { icon: Building2, step: '١', title: 'سجل كمعلن', desc: 'أنشئ حسابك التجاري وحدد ميزانيتك واحتياجاتك الإعلانية.' },
  { icon: Search, step: '٢', title: 'انشر حملة', desc: 'حدد متطلبات حملتك وميزانيتها واطلب عروض من المبدعين.' },
  { icon: Send, step: '٣', title: 'اختر الأفضل', desc: 'راجع عروض المبدعين وتواصل معهم واختر الأنسب لحملتك.' },
  { icon: DollarSign, step: '٤', title: 'وافق وادفع', desc: 'بعد استلام المحتوى قيمه وأفرج عن الدفع مباشرة من خلال المنصة.' },
];

const easeOut = [0.25, 0.1, 0, 1] as const;

export default function HowItWorksSection() {
  const [tab, setTab] = useState<'creator' | 'advertiser'>('creator');
  const steps = tab === 'creator' ? creatorSteps : advertiserSteps;
  const isCreator = tab === 'creator';

  return (
    <section id="how-it-works" className="relative py-24 bg-gray-50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50" />

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="text-center mb-12"
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-block px-4 py-1.5 rounded-full bg-gray-200 text-gray-600 text-sm font-medium mb-4"
          >
            خطوات بسيطة
          </motion.span>
          <h2 className="text-4xl sm:text-5xl font-bold text-black tracking-tight">
            ابدأ في دقائق
          </h2>
          <p className="mt-4 text-gray-500 text-lg">اختر دورك واكتشف كيف تعمل المنصة</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center mb-14"
        >
          <div className="inline-flex bg-white border border-gray-200 rounded-2xl p-1.5 shadow-sm">
            <button
              onClick={() => setTab('creator')}
              className={`flex items-center gap-2.5 px-6 py-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                isCreator
                  ? 'bg-black text-white shadow-md scale-105'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <User className="w-4 h-4" />
              للمبدعين
            </button>
            <button
              onClick={() => setTab('advertiser')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                !isCreator
                  ? 'bg-black text-white shadow-md scale-105'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <Building2 className="w-4 h-4" />
              للمعلنين
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: isCreator ? -40 : 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isCreator ? 40 : -40 }}
            transition={{ duration: 0.4, ease: easeOut }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: easeOut }}
                className="relative p-6 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-400">الخطوة {step.step}</span>
                </div>
                <h3 className="text-lg font-bold text-black mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>

                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-3 text-gray-200">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
