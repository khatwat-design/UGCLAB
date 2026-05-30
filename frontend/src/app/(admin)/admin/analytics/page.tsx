'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import {
  Users, UserCheck, Building2, Megaphone, TrendingUp,
  DollarSign, Wallet, ShieldAlert, Send, BarChart3, PieChart,
  Calendar, Filter, Clock, Eye, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { StatsGridSkeleton } from '@/components/shared/Skeleton';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const monthNames: Record<string, string> = {
  '01': 'يناير', '02': 'فبراير', '03': 'مارس', '04': 'إبريل',
  '05': 'مايو', '06': 'يونيو', '07': 'يوليو', '08': 'أغسطس',
  '09': 'سبتمبر', '10': 'أكتوبر', '11': 'نوفمبر', '12': 'ديسمبر',
};

function formatMonth(ym: string) {
  const [, m] = ym.split('-');
  return monthNames[m] || ym;
}

function maxValue(obj: Record<string, number>): number {
  return Math.max(...Object.values(obj).map(Number), 1);
}

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics').then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-8">
        <div><h1 className="page-title">التحليلات</h1><p className="page-subtitle">إحصائيات وتحليلات المنصة</p></div>
        <StatsGridSkeleton count={8} />
      </div>
    );
  }

  const s = data.summary || {};
  const genderDist = data.gender_distribution || [];
  const ageDist = data.age_distribution || {};
  const campDemo = data.campaign_demographics || {};
  const categoryStats = data.category_distribution || [];
  const monthlyReg = data.monthly_registrations || {};
  const monthlyCamps = data.monthly_campaigns || {};
  const monthlyRev = data.monthly_revenue || {};
  const campStatusStats = data.campaign_status_stats || [];
  const recentUsers = data.recent_users || [];
  const recentCampaigns = data.recent_campaigns || [];

  const maleCount = genderDist.filter((g: any) => g.gender === 'male').reduce((s: number, g: any) => s + g.count, 0);
  const femaleCount = genderDist.filter((g: any) => g.gender === 'female').reduce((s: number, g: any) => s + g.count, 0);
  const totalWithGender = maleCount + femaleCount;

  const statusLabels: Record<string, string> = {
    draft: 'مسودة', open: 'مفتوحة', active: 'نشطة',
    completed: 'مكتملة', cancelled: 'ملغية',
  };
  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100', open: 'bg-gray-300', active: 'bg-black',
    completed: 'bg-gray-500', cancelled: 'bg-gray-200',
  };

  const kpiCards = [
    { title: 'إجمالي المستخدمين', value: s.total_users ?? 0, icon: <Users className="w-4 h-4" />, subtitle: `مبدعون: ${s.total_creators ?? 0} · معلنون: ${s.total_advertisers ?? 0}` },
    { title: 'الحملات النشطة', value: s.active_campaigns ?? 0, icon: <Megaphone className="w-4 h-4" />, subtitle: `إجمالي: ${s.total_campaigns ?? 0}` },
    { title: 'إيرادات المنصة', value: `$${Number(s.platform_revenue ?? 0).toFixed(2)}`, icon: <DollarSign className="w-4 h-4" />, subtitle: 'المدفوعات المفرج عنها' },
    { title: 'المدفوعات المحجوزة', value: `$${Number(s.payments_held ?? 0).toFixed(2)}`, icon: <Wallet className="w-4 h-4" />, subtitle: `مفرج عنه: $${Number(s.payments_released ?? 0).toFixed(2)}` },
    { title: 'أرصدة المحافظ', value: `$${Number(s.total_wallet_balance ?? 0).toFixed(2)}`, icon: <Wallet className="w-4 h-4" />, subtitle: `معلق: $${Number(s.total_wallet_pending ?? 0).toFixed(2)}` },
    { title: 'توثيق KYC', value: s.pending_kyc ?? 0, icon: <ShieldAlert className="w-4 h-4" />, subtitle: 'بانتظار المراجعة' },
    { title: 'إيداعات معلقة', value: s.pending_deposits ?? 0, icon: <Send className="w-4 h-4" />, subtitle: 'بانتظار الموافقة' },
    { title: 'طلبات تسوية', value: s.pending_settlements ?? 0, icon: <Clock className="w-4 h-4" />, subtitle: 'بانتظار المعالجة' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <Toaster position="top-center" />

      {/* Header */}
      <motion.div variants={item}>
        <h1 className="page-title">التحليلات</h1>
        <p className="page-subtitle">إحصائيات وتحليلات متقدمة للمنصة</p>
      </motion.div>

      {/* KPI Grid */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div key={card.title} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">{card.title}</span>
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">{card.icon}</div>
            </div>
            <p className="text-xl font-bold text-black">{card.value}</p>
            {card.subtitle && <p className="text-[10px] text-gray-400 mt-1">{card.subtitle}</p>}
          </div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* ── Gender + Age Demographics ── */}
        <motion.div variants={item}>
          <h2 className="text-sm font-bold text-black mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" /> التوزيع حسب الجنس
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            {['male', 'female'].map((g) => {
              const count = g === 'male' ? maleCount : femaleCount;
              const pct = totalWithGender > 0 ? (count / totalWithGender) * 100 : 0;
              return (
                <div key={g}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-gray-700">{g === 'male' ? 'ذكور' : 'إناث'}</span>
                    <span className="text-gray-500">{count} مستخدم ({Math.round(pct)}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${g === 'male' ? 'bg-black' : 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
              {genderDist.filter((g: any) => g.role === 'creator').length > 0 && (
                <div>
                  <p className="text-[10px] text-gray-400 mb-0.5">مبدعون ذكور</p>
                  <p className="text-sm font-bold text-black">
                    {genderDist.filter((g: any) => g.gender === 'male' && g.role === 'creator').reduce((s: number, g: any) => s + g.count, 0)}
                  </p>
                </div>
              )}
              {genderDist.filter((g: any) => g.role === 'creator').length > 0 && (
                <div>
                  <p className="text-[10px] text-gray-400 mb-0.5">مبدعات إناث</p>
                  <p className="text-sm font-bold text-black">
                    {genderDist.filter((g: any) => g.gender === 'female' && g.role === 'creator').reduce((s: number, g: any) => s + g.count, 0)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Age Distribution ── */}
        <motion.div variants={item}>
          <h2 className="text-sm font-bold text-black mb-3 flex items-center gap-2">
            <PieChart className="w-4 h-4" /> التوزيع العمري
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="grid grid-cols-5 gap-2">
              {(Object.entries(ageDist) as [string, number][]).map(([label, count]) => {
                const ageLabels: Record<string, string> = {
                  under_18: 'أقل من 18', '18_24': '18 - 24', '25_34': '25 - 34',
                  '35_44': '35 - 44', '45_plus': '45+',
                };
                const allCounts = Object.values(ageDist).map(Number);
                const maxA = Math.max(...allCounts, 1);
                return (
                  <div key={label} className="flex flex-col items-center gap-1.5">
                    <span className="text-xs font-bold text-black">{count}</span>
                    <div className="w-full h-16 bg-gray-50 rounded-lg flex items-end justify-center overflow-hidden">
                      <div className="w-4/5 bg-black rounded-t-sm transition-all" style={{ height: `${(count / maxA) * 100}%` }} />
                    </div>
                    <span className="text-[9px] text-gray-400 text-center">{ageLabels[label] || label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Platform Growth ── */}
      <motion.div variants={item}>
        <h2 className="text-sm font-bold text-black mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> نمو المنصة (آخر 12 شهر)
        </h2>
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-bold text-gray-500 mb-3">التسجيلات الشهرية</h3>
            {Object.keys(monthlyReg).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(monthlyReg).reverse().slice(0, 12).map(([month, count]: any) => (
                  <div key={month}>
                    <div className="flex items-center justify-between text-[11px] mb-0.5">
                      <span className="text-gray-500">{formatMonth(month)}</span>
                      <span className="text-black font-medium">{count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-black rounded-full" style={{ width: `${(Number(count) / maxValue(monthlyReg)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-gray-400">لا توجد بيانات</p>}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-bold text-gray-500 mb-3">الحملات الشهرية</h3>
            {Object.keys(monthlyCamps).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(monthlyCamps).reverse().slice(0, 12).map(([month, count]: any) => (
                  <div key={month}>
                    <div className="flex items-center justify-between text-[11px] mb-0.5">
                      <span className="text-gray-500">{formatMonth(month)}</span>
                      <span className="text-black font-medium">{count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-500 rounded-full" style={{ width: `${(Number(count) / maxValue(monthlyCamps)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-gray-400">لا توجد بيانات</p>}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-bold text-gray-500 mb-3">الإيرادات الشهرية</h3>
            {Object.keys(monthlyRev).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(monthlyRev).reverse().slice(0, 12).map(([month, total]: any) => (
                  <div key={month}>
                    <div className="flex items-center justify-between text-[11px] mb-0.5">
                      <span className="text-gray-500">{formatMonth(month)}</span>
                      <span className="text-black font-medium">${Number(total).toFixed(2)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600 rounded-full" style={{ width: `${(Number(total) / maxValue(monthlyRev)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-gray-400">لا توجد بيانات</p>}
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Creator Categories ── */}
        <motion.div variants={item}>
          <h2 className="text-sm font-bold text-black mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> توزيع المبدعين حسب التصنيف
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            {categoryStats.length > 0 ? categoryStats.map((cat: any, i: number) => {
              const maxCat = Math.max(...categoryStats.map((c: any) => c.count), 1);
              return (
                <div key={cat.category}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-700">{cat.category}</span>
                    <span className="text-gray-500">{cat.count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-black rounded-full" style={{ width: `${(cat.count / maxCat) * 100}%` }} />
                  </div>
                </div>
              );
            }) : <p className="text-xs text-gray-400">لا توجد بيانات</p>}
          </div>
        </motion.div>

        {/* ── Campaign Targeting ── */}
        <motion.div variants={item}>
          <h2 className="text-sm font-bold text-black mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4" /> استهدافات الحملات
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">حملات تستهدف ذكور</p>
                <p className="text-xl font-bold text-black">{campDemo.target_gender?.male || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">حملات تستهدف إناث</p>
                <p className="text-xl font-bold text-black">{campDemo.target_gender?.female || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">باستهداف ديموغرافي</p>
                <p className="text-xl font-bold text-black">{campDemo.total_with_targeting || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">متوسط العمر (أدنى)</p>
                <p className="text-xl font-bold text-black">{Math.round(campDemo.avg_age_min || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">متوسط العمر (أقصى)</p>
                <p className="text-xl font-bold text-black">{Math.round(campDemo.avg_age_max || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">متوسط الفيديوهات</p>
                <p className="text-xl font-bold text-black">{Math.round(campDemo.avg_videos_per_creator || 1)}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Campaign Status Breakdown ── */}
      <motion.div variants={item}>
        <h2 className="text-sm font-bold text-black mb-3 flex items-center gap-2">
          <Megaphone className="w-4 h-4" /> حالة الحملات
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="grid grid-cols-5 gap-4">
            {campStatusStats.length > 0 ? campStatusStats.map((cs: any) => {
              const total = campStatusStats.reduce((s: number, c: any) => s + c.count, 0);
              const pct = total > 0 ? (cs.count / total) * 100 : 0;
              return (
                <div key={cs.status} className="text-center">
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div className={`h-full rounded-full ${statusColors[cs.status] || 'bg-gray-300'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-lg font-bold text-black">{cs.count}</p>
                  <p className="text-[10px] text-gray-400">{statusLabels[cs.status] || cs.status}</p>
                </div>
              );
            }) : <p className="text-xs text-gray-400 col-span-5 text-center">لا توجد بيانات</p>}
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Recent Users ── */}
        <motion.div variants={item}>
          <h2 className="text-sm font-bold text-black mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" /> أحدث المستخدمين
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {recentUsers.length > 0 ? recentUsers.slice(0, 8).map((u: any) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                {u.avatar ? (
                  <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {u.name?.[0] || '?'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-black truncate">{u.name}</p>
                  <p className="text-[11px] text-gray-400 truncate">{u.email}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  u.role === 'creator' ? 'bg-gray-100 text-gray-700' :
                  u.role === 'advertiser' ? 'bg-black text-white' :
                  'bg-gray-50 text-gray-500'
                }`}>
                  {u.role === 'creator' ? 'مبدع' : u.role === 'advertiser' ? 'معلن' : u.role}
                </span>
              </div>
            )) : (
              <div className="p-5 text-center text-xs text-gray-400">لا يوجد مستخدمون</div>
            )}
          </div>
        </motion.div>

        {/* ── Recent Campaigns ── */}
        <motion.div variants={item}>
          <h2 className="text-sm font-bold text-black mb-3 flex items-center gap-2">
            <Megaphone className="w-4 h-4" /> أحدث الحملات
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {recentCampaigns.length > 0 ? recentCampaigns.slice(0, 8).map((c: any) => (
              <div key={c.id} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-black truncate">{c.title}</p>
                  <p className="text-[11px] text-gray-400">{c.advertiser?.name || 'غير معروف'}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  c.status === 'active' ? 'bg-black text-white' :
                  c.status === 'completed' ? 'bg-gray-100 text-gray-500' :
                  c.status === 'open' ? 'bg-gray-100 text-gray-700' :
                  'bg-gray-50 text-gray-400'
                }`}>
                  {statusLabels[c.status] || c.status}
                </span>
              </div>
            )) : (
              <div className="p-5 text-center text-xs text-gray-400">لا توجد حملات</div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
