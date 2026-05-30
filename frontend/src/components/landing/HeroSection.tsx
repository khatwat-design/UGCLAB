'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const words = ['المعلنين', 'العلامات', 'الشركات', 'الجمهور'];

const partners = [
  { name: 'شريك 1', image: '/partners/partner1.png' },
  { name: 'شريك 2', image: '/partners/partner2.png' },
  { name: 'شريك 3', image: '/partners/partner3.jpeg' },
  { name: 'شريك 4', image: '/partners/partner4.png' },
];

function PartnersMarquee() {
  return (
    <div className="relative overflow-hidden" dir="ltr">
      <motion.div
        className="flex gap-12"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {[...partners, ...partners].map((partner, i) => (
          <div key={i} className="flex-shrink-0 w-20 h-16 sm:w-24 sm:h-20" title={partner.name}>
            <img
              src={partner.image}
              alt={partner.name}
              className="w-full h-full object-contain opacity-60 hover:opacity-100 transition-opacity duration-300"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const div = document.createElement('div');
                  div.className = 'w-full h-full flex items-center justify-center text-white/20 text-sm font-medium';
                  div.textContent = partner.name;
                  parent.appendChild(div);
                }
              }}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-950" />

      <div className="absolute inset-0 opacity-[0.15]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '0s', animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-3xl" />
      </div>

      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="absolute top-20 left-10 w-16 h-16 border border-white/10 rounded-xl rotate-12 animate-float" style={{ animationDelay: '0.5s', animationDuration: '8s' }} />
      <div className="absolute bottom-32 right-16 w-12 h-12 border border-white/10 rounded-full animate-float" style={{ animationDelay: '2s', animationDuration: '7s' }} />
      <div className="absolute top-1/3 right-20 w-8 h-8 border border-white/10 rotate-45 animate-float" style={{ animationDelay: '3s', animationDuration: '9s' }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.1, 0, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-[1.1] mt-8"
        >
          <span className="block">حوّل إبداعك إلى</span>
          <span className="block mt-2 sm:mt-3 text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
            <span className="text-gray-400">فرص حقيقية مع </span>
            <span className="relative inline-block min-w-[2ch]">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={words[wordIndex]}
                  initial={{ y: 40, opacity: 0, rotateX: -90 }}
                  animate={{ y: 0, opacity: 1, rotateX: 0 }}
                  exit={{ y: -40, opacity: 0, rotateX: 90 }}
                  transition={{ duration: 0.5, ease: [0.25, 0.1, 0, 1] }}
                  className="inline-block text-white"
                  style={{ perspective: '800px' }}
                >
                  {words[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0, 1] }}
          className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
        >
          منصة عراقية متكاملة تصمم جسر الثقة بين صناع المحتوى والعلامات التجارية.
          اعرض خدماتك، ابحث عن الفرص، وحوّل شغفك إلى مهنة.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease: [0.25, 0.1, 0, 1] }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="/register?role=creator"
            className="group inline-flex items-center gap-2.5 px-8 py-4 bg-white text-black rounded-xl font-bold text-base hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>أبدأ كمبدع</span>
            <motion.span
              className="inline-block"
              initial={{ x: 0 }}
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              ←
            </motion.span>
          </a>
          <a
            href="/register?role=advertiser"
            className="group inline-flex items-center gap-2.5 px-8 py-4 bg-white/5 text-white rounded-xl font-bold text-base border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <span>أبدأ كمعلن</span>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-16 sm:mt-20"
        >
          <p className="text-xs tracking-widest text-white/20 mb-5">شركاء النجاح</p>
          <PartnersMarquee />
        </motion.div>
      </div>
    </section>
  );
}
