'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const people = [
  { name: 'أحمد علي', role: 'مبدع محتوى', tag: 'تصوير وفيديو', type: 'creator' },
  { name: 'سارة جاسم', role: 'مبدعة محتوى', tag: 'موضة وجمال', type: 'creator' },
  { name: 'محمد رضا', role: 'مبدع محتوى', tag: 'تقنية وألعاب', type: 'creator' },
  { name: 'نور الزيدي', role: 'مبدعة محتوى', tag: 'طبخ وسفر', type: 'creator' },
  { name: 'علي حسين', role: 'مبدع محتوى', tag: 'رياضة ولياقة', type: 'creator' },
  { name: 'زينب كاظم', role: 'مبدعة محتوى', tag: 'تصميم وفن', type: 'creator' },
  { name: 'شركة تك', role: 'معلن', tag: 'تقنية', type: 'advertiser' },
  { name: 'متجر زين', role: 'معلن', tag: 'أزياء', type: 'advertiser' },
  { name: 'مطعم بغداد', role: 'معلن', tag: 'مطاعم', type: 'advertiser' },
  { name: 'أكاديمية المستقبل', role: 'معلن', tag: 'تعليم', type: 'advertiser' },
  { name: 'صيدلية الشفاء', role: 'معلن', tag: 'صحة', type: 'advertiser' },
  { name: 'وكالة سفر', role: 'معلن', tag: 'سياحة', type: 'advertiser' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.3 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0, 1] as const },
  },
};

export default function CommunitySection() {
  const [filter, setFilter] = useState<'all' | 'creator' | 'advertiser'>('all');

  const filtered = filter === 'all' ? people : people.filter((p) => p.type === filter);

  return (
    <section className="relative py-28 overflow-hidden bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium mb-4">
            مجتمع UGCLab
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-black tracking-tight">
            يجمعنا الإبداع
          </h2>
          <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">
            مبدعون وعلامات تجارية يبنون علاقات مهنية يومياً
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex justify-center gap-2 mb-12"
        >
          {[
            { key: 'all', label: 'الجميع' },
            { key: 'creator', label: 'المبدعين' },
            { key: 'advertiser', label: 'المعلنين' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as typeof filter)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                filter === f.key
                  ? 'bg-black text-white shadow-md scale-105'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </motion.div>

        <motion.div
          key={filter}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4"
        >
          {filtered.map((person) => (
            <motion.div
              key={person.name}
              variants={cardVariants}
              whileHover={{ y: -4, scale: 1.03, transition: { duration: 0.2 } }}
              className="relative p-4 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-md transition-all duration-300 text-center"
            >
              <div
                className={`w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-lg font-bold text-white ${
                  person.type === 'creator' ? 'bg-gray-800' : 'bg-gray-600'
                }`}
              >
                {person.name[0]}
              </div>
              <p className="text-sm font-bold text-black leading-tight">{person.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{person.role}</p>
              <span
                className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                  person.type === 'creator'
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-gray-800 text-white'
                }`}
              >
                {person.tag}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-gray-400">
            ينضم إلينا العشرات أسبوعياً —{' '}
            <a href="/register" className="text-black font-bold underline underline-offset-2 hover:no-underline">
              كن أنت التالي
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
