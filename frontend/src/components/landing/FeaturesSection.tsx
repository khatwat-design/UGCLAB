'use client';

import { motion } from 'framer-motion';
import {
  Shield,
  Handshake,
  Wallet,
  BarChart3,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'دفع آمن ومضمون',
    desc: 'نظام ضمان يضمن حقوق الطرفين. الدفع يكون عبر المنصة ويصرف فقط بعد الموافقة على التسليم.',
  },
  {
    icon: Handshake,
    title: 'توثيق الاحترافية',
    desc: 'مبدعون موثوقون بمحاتهم التفصيلية ومعدلات تفاعلهم الحقيقية تساعدك في اختيار الأفضل.',
  },
  {
    icon: Wallet,
    title: 'محفظة رقمية متكاملة',
    desc: 'إدارة أرباحك ومصروفاتك بسهولة مع محفظة رقمية تدعم السحب والإيداع المحلي.',
  },
  {
    icon: BarChart3,
    title: 'تحليلات دقيقة',
    desc: 'تقارير مفصلة عن أداء حملاتك ومعدلات التفاعل والعائد على الاستثمار في الوقت الفعلي.',
  },
  {
    icon: MessageSquare,
    title: 'تواصل مباشر',
    desc: 'نظام رسائل مدمج يتيح التواصل الشفاف بين المبدعين والمعلنين دون مغادرة المنصة.',
  },
  {
    icon: Sparkles,
    title: 'فرص لا محدودة',
    desc: 'اكتشف حملات إعلانية متنوعة تطابق مهاراتك واهتماماتك وتواصل مع علامات تجارية رائدة.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0, 1] as const },
  },
};

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 bg-white overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0, 1] }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-block px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium mb-4"
          >
            لماذا UGCLab؟
          </motion.span>
          <h2 className="text-4xl sm:text-5xl font-bold text-black tracking-tight">
            كل ما تحتاجه في مكان واحد
          </h2>
          <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">
            منصة متكاملة صممت لتكون جسر الثقة بين المبدعين والمعلنين في العراق
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
              className="group relative p-6 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 transition-all duration-300 hover:shadow-lg"
            >
              <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-black mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>

              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
