'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Plus, Megaphone, TrendingUp, Clock, Users, Rocket,
  ArrowLeft, Sparkles, BarChart3, Target, Eye, MessageSquare,
} from 'lucide-react';
import StatsCard from '@/components/shared/StatsCard';
import { StatsGridSkeleton, CampaignListSkeleton } from '@/components/shared/Skeleton';

const statusBadge: Record<string, { label: string; classes: string }> = {
  open: { label: 'مفتوحة', classes: 'bg-gray-100 text-gray-700' },
  active: { label: 'نشطة', classes: 'bg-black text-white' },
  completed: { label: 'مكتملة', classes: 'bg-gray-100 text-gray-500' },
  draft: { label: 'مسودة', classes: 'bg-gray-50 text-gray-400' },
  cancelled: { label: 'ملغية', classes: 'bg-gray-50 text-gray-400' },
};

const quickActions = [
  { label: 'حملة جديدة', href: '/advertiser/campaigns/new', icon: Plus, desc: 'أنشئ حملة وابحث عن مبدعين' },
  { label: 'استعرض المبدعين', href: '/advertiser/creators', icon: Users, desc: 'ابحث عن صناع المحتوى' },
  { label: 'الرسائل', href: '/advertiser/messages', icon: MessageSquare, desc: 'تواصل مع المبدعين' },
  { label: 'الفواتير', href: '/advertiser/billing', icon: TrendingUp, desc: 'إدارة رصيدك ومدفوعاتك' },
];

const tips = [
  'كلما كان الوصف أدق، زادت جودة الطلبات التي تستقبلها',
  'تواصل مع المبدعين قبل قبول طلبهم لتوضيح رؤيتك',
  'حدد ميزانية واقعية تجذب أفضل المبدعين',
  'استخدم الـ Brief لشرح تفاصيل حملتك بدقة',
];

export default function AdvertiserDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);
  const [user, setUser] = useState<any>(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'صباح الخير' : hour < 18 ? 'مساء الخير' : 'مساء الخير';

  useEffect(() => {
    api.get('/advertiser/dashboard')
      .then((r) => setData(r.data))
      .catch(() => setData({
        active_campaigns: 0, completed_campaigns: 0,
        total_spent: 0, pending_applications: 0, recent_campaigns: [],
      }))
      .finally(() => setLoading(false));
    api.get('/auth/me').then((r) => setUser(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % tips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const completedRate = data?.active_campaigns + data?.completed_campaigns > 0
    ? Math.round((data.completed_campaigns / (data.active_campaigns + data.completed_campaigns)) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* KYC Banner */}
      {user && user.kyc_status && user.kyc_status !== 'verified' && user.kyc_status !== 'not_submitted' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl border p-4 flex items-start gap-3 ${
            user.kyc_status === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
          }`}
        >
          <div className="flex-1">
            <p className={`text-sm font-bold ${user.kyc_status === 'rejected' ? 'text-red-800' : 'text-amber-800'}`}>
              {user.kyc_status === 'rejected' ? 'لم يتم توثيق حسابك' : 'توثيق الحساب قيد المراجعة'}
            </p>
            <p className={`text-xs mt-0.5 ${user.kyc_status === 'rejected' ? 'text-red-600' : 'text-amber-600'}`}>
              {user.kyc_status === 'rejected'
                ? 'يرجى زيارة صفحة توثيق الحساب لمعرفة التفاصيل وإعادة رفع المستندات'
                : 'مستنداتك قيد المراجعة من قبل فريق UGCLab'}
            </p>
          </div>
          <Link
            href="/kyc"
            className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
              user.kyc_status === 'rejected'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-amber-600 text-white hover:bg-amber-700'
            }`}
          >
            {user.kyc_status === 'rejected' ? 'إعادة الرفع' : 'عرض الحالة'}
          </Link>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-xl font-bold text-black">{greeting} 👋</h1>
          </div>
          <p className="text-sm text-gray-400">نظرة عامة على أداء حملاتك</p>
        </div>
        <Link
          href="/advertiser/campaigns/new"
          className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all hover:shadow-lg hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          حملة جديدة
        </Link>
      </motion.div>

      {loading ? (
        <StatsGridSkeleton count={4} />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatsCard title="الحملات النشطة" value={data?.active_campaigns || 0}
            icon={<Megaphone className="w-4 h-4 text-gray-600" />}
            subtitle={data?.active_campaigns > 0 ? 'قيد التنفيذ' : 'لا توجد'} />
          <StatsCard title="الحملات المكتملة" value={data?.completed_campaigns || 0}
            icon={<Rocket className="w-4 h-4 text-gray-600" />}
            subtitle={completedRate > 0 ? `${completedRate}% إنجاز` : ''} />
          <StatsCard title="إجمالي المصروف" value={`$${data?.total_spent || 0}`}
            icon={<BarChart3 className="w-4 h-4 text-gray-600" />} />
          <StatsCard title="الطلبات المعلقة" value={data?.pending_applications || 0}
            icon={<Clock className="w-4 h-4 text-gray-600" />}
            subtitle={data?.pending_applications > 0 ? 'بانتظار المراجعة' : 'لا توجد'} />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-xl border border-gray-200 p-5"
      >
        <div className="flex items-center gap-2 text-amber-600 mb-2">
          <Sparkles className="w-4 h-4" />
          <p className="text-xs font-medium text-gray-500">نصيحة سريعة</p>
        </div>
        <motion.p
          key={tipIndex}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="text-sm text-gray-700"
        >
          {tips[tipIndex]}
        </motion.p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-black">آخر الحملات</h2>
            <Link
              href="/advertiser/campaigns"
              className="text-xs text-gray-400 hover:text-black transition-colors inline-flex items-center gap-1"
            >
              عرض الكل <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {loading
              ? <CampaignListSkeleton count={3} />
              : data?.recent_campaigns?.length > 0
                ? data.recent_campaigns.map((c: any, i: number) => {
                    const s = statusBadge[c.status] || statusBadge.draft;
                    return (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 + i * 0.04 }}
                      >
                        <Link
                          href={`/advertiser/campaigns/${c.id}`}
                          className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-gray-200 transition-colors">
                                <Megaphone className="w-5 h-5 text-gray-500" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm text-black truncate">{c.title}</p>
                                <p className="text-xs text-gray-400">
                                  <span>{c.applications_count || 0} متقدم</span>
                                  <span className="mx-1.5">·</span>
                                  <span>${c.budget}</span>
                                </p>
                              </div>
                            </div>
                            <span className={`shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full ${s.classes}`}>
                              {s.label}
                            </span>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })
                : (
                  <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
                    <Megaphone className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">لا توجد حملات بعد</p>
                    <Link href="/advertiser/campaigns/new" className="inline-block mt-2 text-xs text-black font-bold underline underline-offset-2">
                      أنشئ أول حملة الآن
                    </Link>
                  </div>
                )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="text-sm font-bold text-black mb-4">إجراءات سريعة</h2>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center mb-2.5 group-hover:bg-black group-hover:text-white transition-all">
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-black">{action.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{action.desc}</p>
                </Link>
              );
            })}
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">نشاط اليوم</span>
              <span className="text-[10px] text-gray-400">آخر ٢٤ ساعة</span>
            </div>
            <div className="space-y-2">
              {[
                { icon: Eye, text: '٣ مشاهدات لحملاتك', time: 'منذ ساعة' },
                { icon: Users, text: 'تقديم جديد من مبدع', time: 'منذ ٣ ساعات' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                      <Icon className="w-3 h-3 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 truncate">{item.text}</p>
                      <p className="text-[10px] text-gray-400">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
