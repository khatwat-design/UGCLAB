'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Users, Building2, TrendingUp, Star } from 'lucide-react';

const stats = [
  { value: 150, label: 'مبدع محتوى', suffix: '+', icon: Users },
  { value: 80, label: 'معلن', suffix: '+', icon: Building2 },
  { value: 300, label: 'حملة منجزة', suffix: '+', icon: TrendingUp },
  { value: 95, label: 'نسبة رضا', suffix: '%', icon: Star },
];

function AnimatedCounter({
  target,
  suffix = '',
  isPercentage = false,
}: {
  target: number;
  suffix?: string;
  isPercentage?: boolean;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLParagraphElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const steps = 50;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <p ref={ref} className={`font-bold text-white leading-none ${isPercentage ? 'text-5xl md:text-6xl' : 'text-5xl md:text-6xl'}`}>
      {count.toLocaleString('ar-IQ')}
      <span className="text-gray-400">{suffix}</span>
    </p>
  );
}

export default function StatsSection() {
  return (
    <section className="relative py-28 overflow-hidden bg-gray-900">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-gray-950" />

      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl" />
      </div>

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 text-gray-400 text-sm border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            المنصة في أرقام
          </span>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            const isPercentage = stat.suffix === '%';

            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="group relative p-6 md:p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-500"
              >
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-6 h-6 text-gray-300" />
                  </div>

                  <div>
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} isPercentage={isPercentage} />
                    <div className="h-px w-0 group-hover:w-full bg-white/10 mx-auto mt-3 mb-3 transition-all duration-500" />
                    <p className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors duration-300">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
