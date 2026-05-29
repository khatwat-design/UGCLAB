'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users, UserCheck, Building2, Megaphone, TrendingUp,
  DollarSign, Wallet, BarChart3, Sparkles, ArrowLeft,
  Shield,
} from 'lucide-react';
import StatsCard from '@/components/shared/StatsCard';
import { StatsGridSkeleton, TableSkeleton, CampaignListSkeleton } from '@/components/shared/Skeleton';
import { formatDate } from '@/lib/utils';
import Badge from '@/components/shared/Badge';

const quickActions = [
  { label: 'المستخدمين', href: '/admin/users', icon: Users, desc: 'إدارة المستخدمين' },
  { label: 'الحملات', href: '/admin/campaigns', icon: Megaphone, desc: 'مراقبة الحملات' },
  { label: 'المدفوعات', href: '/admin/payments', icon: DollarSign, desc: 'إدارة المدفوعات' },
  { label: 'سجل النشاطات', href: '/admin/logs', icon: Shield, desc: 'عرض سجل الإداريين' },
];

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((r) => setData(r.data))
      .catch(() => setData({
        total_users: 0, total_creators: 0, total_advertisers: 0,
        total_campaigns: 0, active_campaigns: 0,
        total_payments_held: 0, total_payments_released: 0, platform_revenue: 0,
        recent_users: [], recent_campaigns: [],
      }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-xl font-bold text-black">لوحة الإدارة 👋</h1>
          </div>
          <p className="text-sm text-gray-400">نظرة عامة على أداء المنصة</p>
        </div>
      </motion.div>

      {loading ? (
        <StatsGridSkeleton count={8} />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatsCard title="إجمالي المستخدمين" value={data?.total_users || 0}
            icon={<Users className="w-4 h-4 text-gray-600" />} />
          <StatsCard title="المبدعين" value={data?.total_creators || 0}
            icon={<UserCheck className="w-4 h-4 text-gray-600" />} />
          <StatsCard title="المعلنين" value={data?.total_advertisers || 0}
            icon={<Building2 className="w-4 h-4 text-gray-600" />} />
          <StatsCard title="الحملات" value={data?.total_campaigns || 0}
            icon={<Megaphone className="w-4 h-4 text-gray-600" />} />
          <StatsCard title="الحملات النشطة" value={data?.active_campaigns || 0}
            icon={<TrendingUp className="w-4 h-4 text-gray-600" />} />
          <StatsCard title="المدفوعات المعلقة" value={`$${Number(data?.total_payments_held || 0).toFixed(2)}`}
            icon={<Wallet className="w-4 h-4 text-gray-600" />} />
          <StatsCard title="المدفوعات المصروفة" value={`$${Number(data?.total_payments_released || 0).toFixed(2)}`}
            icon={<BarChart3 className="w-4 h-4 text-gray-600" />} />
          <StatsCard title="إيرادات المنصة" value={`$${Number(data?.platform_revenue || 0).toFixed(2)}`}
            icon={<DollarSign className="w-4 h-4 text-gray-600" />} />
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-black">آخر المستخدمين</h2>
            <Link href="/admin/users" className="text-xs text-gray-400 hover:text-black transition-colors inline-flex items-center gap-1">
              عرض الكل <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="card overflow-hidden p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-right p-3 text-xs font-medium text-gray-500">الاسم</th>
                  <th className="text-right p-3 text-xs font-medium text-gray-500">النوع</th>
                  <th className="text-right p-3 text-xs font-medium text-gray-500">الحالة</th>
                  <th className="text-right p-3 text-xs font-medium text-gray-500">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4}><TableSkeleton rows={4} cols={4} /></td></tr>
                ) : data?.recent_users?.length > 0 ? (
                  data.recent_users.map((user: any, i: number) => (
                    <tr key={user.id} className={`border-b border-gray-100 hover:bg-gray-50 ${i === 0 ? '' : ''}`}>
                      <td className="p-3 text-sm">{user.name}</td>
                      <td className="p-3"><Badge status={user.role} /></td>
                      <td className="p-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${
                          user.is_active ? 'text-green-600 border-green-200 bg-green-50' : 'text-red-600 border-red-200 bg-red-50'
                        }`}>
                          {user.is_active ? 'نشط' : 'موقوف'}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-gray-400">{formatDate(user.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="p-6 text-center text-gray-400 text-sm">لا يوجد مستخدمين</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mb-4 mt-8">
            <h2 className="text-sm font-bold text-black">آخر الحملات</h2>
            <Link href="/admin/campaigns" className="text-xs text-gray-400 hover:text-black transition-colors inline-flex items-center gap-1">
              عرض الكل <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {loading
              ? <CampaignListSkeleton count={3} />
              : data?.recent_campaigns?.length > 0
                ? data.recent_campaigns.map((c: any, i: number) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 + i * 0.04 }}
                    >
                      <div className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                              <Megaphone className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm text-black truncate">{c.title}</p>
                              <p className="text-xs text-gray-400">
                                <span>{c.advertiser?.name}</span>
                                <span className="mx-1.5">·</span>
                                <span>${c.budget}</span>
                              </p>
                            </div>
                          </div>
                          <Badge status={c.status} />
                        </div>
                      </div>
                    </motion.div>
                  ))
                : (
                  <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
                    <Megaphone className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">لا توجد حملات بعد</p>
                  </div>
                )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
              <span className="text-xs font-medium text-gray-500">ملخص المنصة</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">نسبة المبدعين</span>
                <span className="text-black font-medium">
                  {data?.total_users > 0
                    ? Math.round((data.total_creators / data.total_users) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">نسبة المعلنين</span>
                <span className="text-black font-medium">
                  {data?.total_users > 0
                    ? Math.round((data.total_advertisers / data.total_users) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">حملات نشطة</span>
                <span className="text-black font-medium">{data?.active_campaigns || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">إيرادات المنصة</span>
                <span className="text-black font-medium">${Number(data?.platform_revenue || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
