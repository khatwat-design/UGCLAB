'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const allPoints = [
  {
    title: 'للراغبين في الإبداع',
    desc: 'انشئ محفظة أعمالك، اعرض خدماتك، وتواصل مع علامات تجارية تبحث عن مبدعين مثلك.',
  },
  {
    title: 'لأصحاب العلامات التجارية',
    desc: 'ابحث عن المبدعين المثاليين لحملاتك، تابع الأداء، وحقق أعلى عائد على الاستثمار.',
  },
  {
    title: 'لمن يبحث عن الثقة',
    desc: 'نظام دفع آمن، توثيق احترافي، وتقارير شفافة تضمن حقوق جميع الأطراف.',
  },
  {
    title: 'نظام دفع آمن وموثوق',
    desc: 'ضمان كامل للحقوق المالية عبر نظام دفع مدمج يحمي أرباح المبدعين وتستثمارات المعلنين.',
  },
  {
    title: 'إحصائيات وتقارير دقيقة',
    desc: 'تابع أداء حملاتك بشكل لحظي مع رسوم بيانية تفاعلية ومؤشرات أداء رئيسية.',
  },
  {
    title: 'معرض أعمال احترافي',
    desc: 'أنشئ محفظة أعمالك الرقمية بسهولة وأظهر إبداعك للعلامات التجارية المهتمة.',
  },
];

const collapseVariants = {
  initial: { opacity: 0, scaleY: 0.8, y: -10, filter: 'blur(4px)' },
  animate: { opacity: 1, scaleY: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, scaleY: 0.8, y: 10, filter: 'blur(4px)' },
};

export default function FeaturesSection() {
  const [displayed, setDisplayed] = useState([0, 1, 2]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseRef = useRef(0);

  const scheduleCycle = useCallback(() => {
    const p = phaseRef.current;
    const nextP = p === 0 ? 1 : 0;
    const base = nextP * 3;

    timerRef.current = setTimeout(() => {
      setDisplayed([base, p === 0 ? 1 : 4, p === 0 ? 2 : 5]);

      timerRef.current = setTimeout(() => {
        setDisplayed([base, base + 1, p === 0 ? 2 : 5]);

        timerRef.current = setTimeout(() => {
          setDisplayed([base, base + 1, base + 2]);
          phaseRef.current = nextP;
          timerRef.current = setTimeout(scheduleCycle, 1000);
        }, 600);
      }, 600);
    }, 3000);
  }, []);

  useEffect(() => {
    timerRef.current = setTimeout(scheduleCycle, 3000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [scheduleCycle]);

  return (
    <section id="features" className="relative py-20 bg-black overflow-hidden">
      <div className="absolute inset-0 text-[13px] text-white/[0.04] font-mono leading-loose tracking-widest pointer-events-none overflow-hidden select-none p-4" aria-hidden="true">
        {'Z R W N   G Q W E   Y R P B   N N K E / H A M U\nR X R     N U T I   S D +                           L\nN O Z     M U M E                                   N\nZ O       Z O D                                     X'}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/60 text-sm font-medium mb-4">
            لماذا UGCLab؟
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            كل ما تحتاجه في مكان واحد
          </h2>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Cards (right) */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0, 1] }}
            className="flex-1 w-full max-w-sm space-y-4"
          >
            {displayed.map((pointIndex, cardIdx) => (
              <div key={cardIdx} className="relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={pointIndex}
                    variants={collapseVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.45, ease: [0.25, 0.1, 0, 1] }}
                    className="bg-white/[0.04] border border-white/10 rounded-xl p-5 backdrop-blur-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/40 text-sm font-bold flex-shrink-0">
                        {pointIndex + 1}
                      </div>
                      <div className="min-h-[72px]">
                        <h3 className="text-white font-bold text-base mb-1.5">{allPoints[pointIndex].title}</h3>
                        <p className="text-white/40 text-sm leading-relaxed">{allPoints[pointIndex].desc}</p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            ))}
          </motion.div>

          {/* Mockups (left) */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0, 1] }}
            className="relative flex-1 w-full max-w-lg lg:max-w-none"
          >
            <div className="bg-white rounded-xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.5)] w-full max-w-[480px]">
              <div className="bg-[#f0eeec] px-3 py-2 flex items-center gap-1.5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 bg-white rounded-md text-[11px] text-gray-400 py-0.5 px-2 mx-2 text-center border border-gray-200/50">
                  ugclab.app/dashboard
                </div>
              </div>
              <div className="bg-[#f9f8f7] p-3 space-y-3">
                <div className="flex items-center gap-3 text-[11px] text-gray-500 border-b border-gray-200 pb-2">
                  <span className="text-black font-medium">← الرئيسية</span>
                  <span>الحملات</span>
                  <span>الرسائل</span>
                  <span className="mr-auto bg-white border border-gray-200 rounded px-2 py-0.5 text-gray-400">بحث</span>
                  <span className="bg-gray-900 text-white rounded px-2 py-0.5 text-[10px]">حسابي</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'الحملات النشطة', value: '12' },
                    { label: 'المبدعون', value: '48' },
                    { label: 'العائد', value: '+٤٢٪' },
                  ].map((s) => (
                    <div key={s.label} className="bg-white rounded-lg border border-gray-100 p-2.5 text-center">
                      <div className="text-lg font-bold text-gray-900">{s.value}</div>
                      <div className="text-[9px] text-gray-400">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  {['حملة صابون طبيعي', 'حملة مطعم بغداد', 'حملة متجر أزياء', 'حملة أكاديمية تعليم'].map((row, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] bg-white rounded border border-gray-100 px-2.5 py-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      <span className="text-gray-800">{row}</span>
                      <span className="mr-auto text-gray-400">نشط</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 right-0 sm:-right-8 w-[130px] sm:w-[150px] bg-[#1a1a1e] rounded-[26px] border-[5px] border-[#2a2a2f] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
              <div className="bg-[#1a1a1e] h-5 flex items-center justify-center">
                <div className="w-[50px] h-[7px] bg-black rounded-full" />
              </div>
              <div className="bg-[#f9f8f7] p-2 space-y-1.5">
                <div className="bg-[#ebebeb] rounded-lg h-4 flex items-center px-2 text-[7px] text-gray-400 gap-1">
                  <span>ابحث عن حملات</span>
                </div>
                <div className="flex gap-1 text-[7px] text-gray-500">
                  <span className="text-black font-medium">الكل</span>
                  <span>تسويق</span>
                  <span>تصميم</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {['تسويق', 'تصميم', 'تصوير', 'كتابة'].map((tag) => (
                    <div key={tag} className="bg-gray-900 text-white rounded-[3px] aspect-[2/3] flex items-center justify-center text-[6px] font-bold text-center p-1">
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#f0efed] flex justify-around py-1.5 text-[9px] text-gray-400">
                <span>●</span>
                <span>●</span>
                <span>●</span>
                <span>●</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
