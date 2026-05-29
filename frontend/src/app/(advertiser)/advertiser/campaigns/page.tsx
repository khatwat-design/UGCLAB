'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import {
  Plus, Megaphone, Search, DollarSign, Users, TrendingUp, Copy,
  BarChart3, MoreHorizontal, CheckCircle2, Clock,
} from 'lucide-react';
import { CampaignListSkeleton } from '@/components/shared/Skeleton';

const statusConfig: Record<string, { label: string; classes: string; icon: any }> = {
  open: { label: 'مفتوحة', classes: 'bg-gray-100 text-gray-700', icon: Clock },
  active: { label: 'نشطة', classes: 'bg-black text-white', icon: TrendingUp },
  completed: { label: 'مكتملة', classes: 'bg-gray-100 text-gray-500', icon: CheckCircle2 },
  draft: { label: 'مسودة', classes: 'bg-gray-50 text-gray-400', icon: MoreHorizontal },
  cancelled: { label: 'ملغية', classes: 'bg-gray-50 text-gray-400', icon: MoreHorizontal },
};

export default function AdvertiserCampaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [duplicating, setDuplicating] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    api.get('/advertiser/campaigns').then((r) => setCampaigns(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const filtered = campaigns.filter((c: any) => {
    if (filter !== 'all' && c.status !== filter) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const tabs = [
    { key: 'all', label: 'الكل', count: campaigns.length },
    { key: 'active', label: 'النشطة', count: campaigns.filter((c) => c.status === 'active').length },
    { key: 'open', label: 'المفتوحة', count: campaigns.filter((c) => c.status === 'open').length },
    { key: 'completed', label: 'المكتملة', count: campaigns.filter((c) => c.status === 'completed').length },
    { key: 'draft', label: 'المسودات', count: campaigns.filter((c) => c.status === 'draft').length },
  ];

  const totalBudget = filtered.reduce((sum, c) => sum + (c.budget || 0), 0);

  const duplicateCampaign = async (campaign: any) => {
    setDuplicating(campaign.id);
    try {
      const res = await api.post('/advertiser/campaigns', {
        title: `${campaign.title} (نسخة)`,
        description: campaign.description,
        brief: campaign.brief || '',
        budget: campaign.budget,
        category: campaign.category || '',
        max_creators: campaign.max_creators || 1,
      });
      toast.success('تم نسخ الحملة بنجاح');
      setCampaigns((prev) => [res.data, ...prev]);
    } catch {
      toast.error('حدث خطأ');
    } finally {
      setDuplicating(null);
    }
  };

  const completedCount = campaigns.filter((c) => c.status === 'completed').length;

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="page-title">حملاتي</h1>
          <p className="page-subtitle">إدارة حملاتك الإعلانية</p>
        </div>
        <Link
          href="/advertiser/campaigns/new"
          className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all hover:shadow-lg hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          حملة جديدة
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-4 gap-3"
      >
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-sm transition-shadow">
          <Megaphone className="w-4 h-4 text-gray-400 mx-auto mb-1.5" />
          <p className="text-lg font-bold text-black">{campaigns.length}</p>
          <p className="text-[11px] text-gray-400">إجمالي الحملات</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-sm transition-shadow">
          <DollarSign className="w-4 h-4 text-gray-400 mx-auto mb-1.5" />
          <p className="text-lg font-bold text-black">${totalBudget.toLocaleString()}</p>
          <p className="text-[11px] text-gray-400">الميزانية الإجمالية</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-sm transition-shadow">
          <BarChart3 className="w-4 h-4 text-gray-400 mx-auto mb-1.5" />
          <p className="text-lg font-bold text-black">
            {campaigns.length > 0 ? Math.round((completedCount / campaigns.length) * 100) : 0}%
          </p>
          <p className="text-[11px] text-gray-400">نسبة الإنجاز</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-sm transition-shadow">
          <Users className="w-4 h-4 text-gray-400 mx-auto mb-1.5" />
          <p className="text-lg font-bold text-black">
            {campaigns.reduce((s, c) => s + (c.applications_count || 0), 0)}
          </p>
          <p className="text-[11px] text-gray-400">إجمالي المتقدمين</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
      >
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filter === t.key ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`text-[10px] ${filter === t.key ? 'text-gray-400' : 'text-gray-400'}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-auto">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن حملة بالعنوان..."
            className="pr-9 pl-4 py-2 rounded-xl border border-gray-200 text-sm bg-white w-full sm:w-56 focus:border-black outline-none transition-colors"
          />
        </div>
      </motion.div>

      {loading ? (
        <CampaignListSkeleton count={5} />
      ) : (
      <div className="space-y-2">
        {filtered.length > 0 ? filtered.map((campaign: any, i: number) => {
          const status = statusConfig[campaign.status] || statusConfig.draft;
          const StatusIcon = status.icon;
          const appCount = campaign.applications_count || 0;
          const acceptedCount = (campaign.applications || []).filter(
            (a: any) => a.status === 'accepted' || a.status === 'completed'
          ).length;
          const progress = campaign.max_creators
            ? Math.min(Math.round((acceptedCount / campaign.max_creators) * 100), 100)
            : 0;
          return (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group"
            >
              <div className="p-5 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/advertiser/campaigns/${campaign.id}`}
                    className="flex-1 min-w-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-black group-hover:text-white transition-all">
                        <Megaphone className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5">
                          <h3 className="font-bold text-sm text-black truncate">{campaign.title}</h3>
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${status.classes}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{campaign.description}</p>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-3 shrink-0 mr-4">
                    <div className="hidden sm:flex items-center gap-3 text-xs text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />${campaign.budget}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3 h-3" />{appCount}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        duplicateCampaign(campaign);
                      }}
                      disabled={duplicating === campaign.id}
                      className="p-2 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition-all"
                      title="نسخ الحملة"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {campaign.max_creators > 0 && (
                  <Link
                    href={`/advertiser/campaigns/${campaign.id}`}
                    className="block mt-3"
                  >
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-1">
                      <span>التقدم: {acceptedCount}/{campaign.max_creators} مبدعين</span>
                      <span className="mr-auto">{progress}%</span>
                    </div>
                    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </Link>
                )}
              </div>
            </motion.div>
          );
        }) : (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <Megaphone className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              {campaigns.length === 0 ? 'لا توجد حملات بعد' : 'لا توجد نتائج للبحث'}
            </p>
            {campaigns.length === 0 && (
              <Link href="/advertiser/campaigns/new" className="inline-block mt-3 text-sm text-black font-bold underline underline-offset-2">
                أنشئ أول حملة
              </Link>
            )}
          </div>
        )}
      </div>
      )}
    </div>
  );
}
