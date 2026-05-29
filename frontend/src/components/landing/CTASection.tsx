'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const easeOut = [0.25, 0.1, 0, 1] as const;

export default function CTASection() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-950" />

      <div className="absolute inset-0 opacity-[0.06]">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float" />
      </div>

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.7, ease: easeOut }}
        className="relative z-10 max-w-3xl mx-auto px-4 text-center"
      >
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="inline-block px-4 py-1.5 rounded-full bg-white/5 text-white/60 text-sm font-medium mb-6 border border-white/10"
        >
          انضم إلينا اليوم
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="text-4xl sm:text-5xl font-bold text-white leading-tight"
        >
          مستعد تبدأ رحلتك؟
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-6 text-lg text-gray-400 leading-relaxed max-w-xl mx-auto"
        >
          انضم إلى آلاف المبدعين والمعلنين الذين يثقون في UGCLab لإدارة تعاونهم الإبداعي
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/register"
            className="group inline-flex items-center gap-2.5 px-8 py-4 bg-white text-black rounded-xl font-bold text-base hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            ابدأ مجاناً
            <motion.span
              className="inline-block"
              initial={{ x: 0 }}
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.span>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-white/5 text-white rounded-xl font-bold text-base border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
          >
            تسجيل الدخول
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
