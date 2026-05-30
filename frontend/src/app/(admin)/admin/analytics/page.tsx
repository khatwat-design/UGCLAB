'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import {
  BarChart3, Users, Megaphone, TrendingUp, PieChart,
  Calendar, UserCheck, Building2, Filter,
} from 'lucide-react';
import { StatsGridSkeleton } from '@/components/shared/Skeleton';

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
        <StatsGridSkeleton count={6} />
      </div>
    );
  }

  const genderDist = data.gender_distribution || [];
  const ageDist = data.age_distribution || {};
  const campDemo = data.campaign_demographics || {};
  const categoryStats = data.category_distribution || [];
  const monthlyReg = data.monthly_registrations || {};
  const monthlyCamps = data.monthly_campaigns || {};

  const maleCount = genderDist.filter((g: any) => g.gender === 'male').reduce((s: number, g: any) => s + g.count, 0);
  const femaleCount = genderDist.filter((g: any) => g.gender === 'female').reduce((s: number, g: any) => s + g.count, 0);
  const totalWithGender = maleCount + femaleCount;

  return (
    <div className="space-y-8">
      <Toaster position="top-center" />
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">التحليلات</h1>
        <p className="page-subtitle">إحصائيات وتحليلات متقدمة للمنصة</p>
      </motion.div>

      {/* Demographics */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-sm font-bold text-black mb-4 flex items-center gap-2">
          <Users className="w-4 h-4" /> التوزيع الديموغرافي
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 mb-1">إجمالي الذكور</p>
            <p className="text-2xl font-bold text-black">{maleCount}</p>
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-black rounded-full" style={{ width: `${totalWithGender > 0 ? (maleCount / totalWithGender) * 100 : 0}%` }} />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">{totalWithGender > 0 ? Math.round((maleCount / totalWithGender) * 100) : 0}% من المسجلين</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 mb-1">إجمالي الإناث</p>
            <p className="text-2xl font-bold text-black">{femaleCount}</p>
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-400 rounded-full" style={{ width: `${totalWithGender > 0 ? (femaleCount / totalWithGender) * 100 : 0}%` }} />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">{totalWithGender > 0 ? Math.round((femaleCount / totalWithGender) * 100) : 0}% من المسجلين</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 mb-1">حملات تستهدف الذكور</p>
            <p className="text-2xl font-bold text-black">{campDemo.target_gender?.male || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 mb-1">حملات تستهدف الإناث</p>
            <p className="text-2xl font-bold text-black">{campDemo.target_gender?.female || 0}</p>
          </div>
        </div>
      </motion.div>

      {/* Age Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h2 className="text-sm font-bold text-black mb-4 flex items-center gap-2">
          <PieChart className="w-4 h-4" /> التوزيع العمري
        </h2>
        <div className="grid grid-cols-5 gap-3">
          {(Object.entries(ageDist) as [string, number][]).map(([label, count]) => {
            const ageLabels: Record<string, string> = {
              under_18: 'أقل من 18',
              '18_24': '18 - 24',
              '25_34': '25 - 34',
              '35_44': '35 - 44',
              '45_plus': '45+',
            };
            return (
              <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">{ageLabels[label] || label}</p>
                <p className="text-xl font-bold text-black">{count}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Campaign targeting */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-sm font-bold text-black mb-4 flex items-center gap-2">
          <Filter className="w-4 h-4" /> استهدافات الحملات
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 mb-1">حملات باستهداف ديموغرافي</p>
            <p className="text-2xl font-bold text-black">{campDemo.total_with_targeting || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 mb-1">متوسط العمر الأدنى</p>
            <p className="text-2xl font-bold text-black">{Math.round(campDemo.avg_age_min || 0)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 mb-1">متوسط العمر الأقصى</p>
            <p className="text-2xl font-bold text-black">{Math.round(campDemo.avg_age_max || 0)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 mb-1">متوسط الفيديوهات لكل مبدع</p>
            <p className="text-2xl font-bold text-black">{Math.round(campDemo.avg_videos_per_creator || 1)}</p>
          </div>
        </div>
      </motion.div>

      {/* Category distribution */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="grid lg:grid-cols-2 gap-6"
      >
        <div>
          <h2 className="text-sm font-bold text-black mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> توزيع المبدعين حسب التصنيف
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            {categoryStats.length > 0 ? categoryStats.map((cat: any, i: number) => (
              <div key={cat.category}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-700">{cat.category}</span>
                  <span className="text-gray-500">{cat.count}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-black rounded-full" style={{ width: `${(cat.count / Math.max(...categoryStats.map((c: any) => c.count))) * 100}%` }} />
                </div>
              </div>
            )) : <p className="text-xs text-gray-400">لا توجد بيانات</p>}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-black mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> نمو المنصة (12 شهر)
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-xs font-bold text-gray-500 mb-2">التسجيلات الشهرية</h3>
            {Object.keys(monthlyReg).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(monthlyReg).reverse().slice(0, 12).map(([month, count]: any) => (
                  <div key={month}>
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="text-gray-500">{month}</span>
                      <span className="text-black font-medium">{count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-black rounded-full" style={{ width: `${(Number(count) / Math.max(...Object.values(monthlyReg).map(Number))) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-gray-400">لا توجد بيانات</p>}

            <div className="pt-3 mt-3 border-t border-gray-100">
              <h3 className="text-xs font-bold text-gray-500 mb-2">الحملات الشهرية</h3>
              {Object.keys(monthlyCamps).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(monthlyCamps).reverse().slice(0, 12).map(([month, count]: any) => (
                    <div key={month}>
                      <div className="flex items-center justify-between text-xs mb-0.5">
                        <span className="text-gray-500">{month}</span>
                        <span className="text-black font-medium">{count}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-500 rounded-full" style={{ width: `${(Number(count) / Math.max(...Object.values(monthlyCamps).map(Number))) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-gray-400">لا توجد بيانات</p>}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
