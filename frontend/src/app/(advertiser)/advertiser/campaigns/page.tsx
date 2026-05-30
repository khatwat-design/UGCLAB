'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import {
  Plus, Megaphone, Search, DollarSign, Users, TrendingUp, Copy,
  BarChart3, MoreHorizontal, CheckCircle2, Clock, Calendar,
  Eye, Edit3, Target, ChevronLeft, ChevronRight, Filter,
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

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

  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
  const totalSpent = campaigns
    .filter((c) => c.status === 'completed' || c.status === 'active')
    .reduce((sum, c) => sum + (c.budget || 0), 0);
  const totalApplicants = campaigns.reduce((s, c) => s + (c.applications_count || 0), 0);
  const avgBudgetPerCampaign = campaigns.length > 0 ? Math.round(totalBudget / campaigns.length) : 0;
  const completedCount = campaigns.filter((c) => c.status === 'completed').length;
  const activeCount = campaigns.filter((c) => c.status === 'active' || c.status === 'open').length;

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
        target_gender: campaign.target_gender || undefined,
        target_age_min: campaign.target_age_min || undefined,
        target_age_max: campaign.target_age_max || undefined,
        videos_per_creator: campaign.videos_per_creator || 1,
      });
      toast.success('تم نسخ الحملة بنجاح');
      setCampaigns((prev) => [res.data, ...prev]);
    } catch {
      toast.error('حدث خطأ');
    } finally {
      setDuplicating(null);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="page-title">حملاتي</h1>
          <p className="page-subtitle">إدارة ومتابعة جميع حملاتك الإعلانية</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-xl p-0.5 gap-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-400 hover:text-black'}`}
              title="عرض القائمة"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-400 hover:text-black'}`}
              title="عرض الشبكة"
            >
              <Filter className="w-4 h-4 rotate-90" />
            </button>
          </div>
          <Link
            href="/advertiser/campaigns/new"
            className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all hover:shadow-lg hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            حملة جديدة
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <Megaphone className="w-4 h-4 text-gray-400" />
            <span className="text-[10px] text-gray-400">الإجمالي</span>
          </div>
          <p className="text-lg font-bold text-black">{campaigns.length}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{activeCount} نشطة حالياً</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="text-[10px] text-gray-400">الميزانية</span>
          </div>
          <p className="text-lg font-bold text-black">${totalBudget.toLocaleString()}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">معدل ${avgBudgetPerCampaign.toLocaleString()} لكل حملة</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-[10px] text-gray-400">المتقدمون</span>
          </div>
          <p className="text-lg font-bold text-black">{totalApplicants}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">على جميع الحملات</p>
        </div>
        <div className={`rounded-xl p-4 border transition-all ${completedCount > 0 ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-200'}`}>
          <div className="flex items-center justify-between mb-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px]">الإنجاز</span>
          </div>
          <p className="text-lg font-bold">
            {campaigns.length > 0 ? Math.round((completedCount / campaigns.length) * 100) : 0}%
          </p>
          <p className="text-[10px] mt-0.5">{completedCount} مكتملة من {campaigns.length}</p>
        </div>
      </motion.div>

      {/* Tabs + Search */}
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
            placeholder="ابحث عن حملة..."
            className="pr-9 pl-4 py-2 rounded-xl border border-gray-200 text-sm bg-white w-full sm:w-56 focus:border-black outline-none transition-colors"
          />
        </div>
      </motion.div>

      {/* Campaign List / Grid */}
      {loading ? (
        <CampaignListSkeleton count={5} />
      ) : filtered.length > 0 ? (
        viewMode === 'grid' ? (
          /* ─── Grid View ─── */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map((campaign: any, i: number) => {
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
                >
                  <Link
                    href={`/advertiser/campaigns/${campaign.id}`}
                    className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all h-full group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                        <Megaphone className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${status.classes}`}>
                        <StatusIcon className="w-2.5 h-2.5" />
                        {status.label}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-black truncate mb-1">{campaign.title}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3 h-8">{campaign.description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-3">
                      <span className="inline-flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />${campaign.budget}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3 h-3" />{appCount}
                      </span>
                      {campaign.max_creators && (
                        <span className="inline-flex items-center gap-1">
                          <Target className="w-3 h-3" />{acceptedCount}/{campaign.max_creators}
                        </span>
                      )}
                    </div>
                    {campaign.max_creators > 0 && (
                      <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-black rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                      </div>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          /* ─── List View ─── */
          <div className="space-y-2">
            {filtered.map((campaign: any, i: number) => {
              const status = statusConfig[campaign.status] || statusConfig.draft;
              const StatusIcon = status.icon;
              const appCount = campaign.applications_count || 0;
              const acceptedCount = (campaign.applications || []).filter(
                (a: any) => a.status === 'accepted' || a.status === 'completed'
              ).length;
              const progress = campaign.max_creators
                ? Math.min(Math.round((acceptedCount / campaign.max_creators) * 100), 100)
                : 0;
              const hasTargeting = campaign.target_gender || campaign.target_age_min;
              return (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <Link
                        href={`/advertiser/campaigns/${campaign.id}`}
                        className="flex-1 min-w-0"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-black group-hover:text-white transition-all">
                            <Megaphone className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <h3 className="font-bold text-sm text-black">{campaign.title}</h3>
                              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${status.classes}`}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{campaign.description}</p>
                          </div>
                        </div>
                      </Link>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="hidden md:flex items-center gap-4 text-xs text-gray-400 ml-2">
                          {campaign.start_date && (
                            <span className="inline-flex items-center gap-1" title="تاريخ البدء">
                              <Calendar className="w-3 h-3" />
                              {new Date(campaign.start_date).toLocaleDateString('ar-IQ')}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1" title="الميزانية">
                            <DollarSign className="w-3 h-3" />${campaign.budget}
                          </span>
                          <span className="inline-flex items-center gap-1" title="المتقدمون">
                            <Users className="w-3 h-3" />{appCount}
                          </span>
                          {hasTargeting && (
                            <span className="inline-flex items-center gap-1" title="استهداف">
                              <Target className="w-3 h-3" />
                              {campaign.target_gender === 'male' ? 'ذكور' : campaign.target_gender === 'female' ? 'إناث' : ''}
                              {campaign.target_age_min && `${campaign.target_age_min}-${campaign.target_age_max || '?'}`}
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/advertiser/campaigns/${campaign.id}`}
                          className="p-2 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition-all"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/advertiser/campaigns/${campaign.id}?edit=1`}
                          className="p-2 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition-all"
                          title="تعديل"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
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
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
            })}
          </div>
        )
      ) : (
        /* ─── Empty State ─── */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-white rounded-xl border border-gray-200"
        >
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-base font-bold text-black mb-1">
            {campaigns.length === 0 ? 'لا توجد حملات بعد' : 'لا توجد نتائج'}
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            {campaigns.length === 0
              ? 'ابدأ بإنشاء أول حملة إعلانية للتواصل مع المبدعين'
              : 'حاول تغيير معايير البحث أو التصفية'}
          </p>
          {campaigns.length === 0 && (
            <Link
              href="/advertiser/campaigns/new"
              className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all hover:shadow-lg hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              أنشئ أول حملة
            </Link>
          )}
        </motion.div>
      )}

      {/* Pagination hint */}
      {filtered.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-xs text-gray-400"
        >
          عرض {filtered.length} من {campaigns.length} حملة
        </motion.div>
      )}
    </div>
  );
}
