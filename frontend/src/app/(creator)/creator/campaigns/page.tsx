'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import CampaignCard from '@/components/shared/CampaignCard';
import { Toaster, toast } from 'react-hot-toast';
import {
  Search, X, Filter, SlidersHorizontal, ChevronDown,
  ChevronLeft, ChevronRight, ArrowUpDown, RotateCcw
} from 'lucide-react';
import { CampaignListSkeleton } from '@/components/shared/Skeleton';
import { CAMPAIGN_CATEGORIES } from '@/lib/constants';

interface Campaign {
  id: number;
  title: string;
  description: string;
  budget: number;
  category: string;
  status: string;
  requirements: string[];
  end_date: string;
  max_creators: number;
  applications_count: number;
  advertiser: { id: number; name: string; avatar: string | null };
  created_at: string;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export default function CreatorCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    budget_min: '',
    budget_max: '',
    sort: 'latest',
  });
  const [page, setPage] = useState(1);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [proposal, setProposal] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, per_page: 12, sort: filters.sort };
      if (filters.category) params.category = filters.category;
      if (filters.budget_min) params.budget_min = parseFloat(filters.budget_min);
      if (filters.budget_max) params.budget_max = parseFloat(filters.budget_max);
      const res = await api.get('/creator/campaigns', { params });
      setCampaigns(res.data.data);
      setMeta(res.data.meta);
    } catch {
      toast.error('فشل تحميل الحملات');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const resetFilters = () => {
    setFilters({ category: '', budget_min: '', budget_max: '', sort: 'latest' });
    setPage(1);
    setSearch('');
  };

  const hasActiveFilters = filters.category || filters.budget_min || filters.budget_max;

  const filtered = campaigns.filter((c) =>
    !search ||
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase()) ||
    c.category?.toLowerCase().includes(search.toLowerCase())
  );

  const handleApply = async () => {
    if (!proposal.trim() || !proposedRate) return;
    setSubmitting(true);
    try {
      await api.post(`/creator/campaigns/${selectedCampaign!.id}/apply`, {
        proposal,
        proposed_rate: parseFloat(proposedRate),
      });
      toast.success('تم تقديم الطلب بنجاح');
      setShowApplyModal(false);
      setProposal('');
      setProposedRate('');
      fetchCampaigns();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">الحملات المتاحة</h1>
          <p className="page-subtitle">تصفح الحملات المناسبة لك وتقدم لها</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary text-sm flex items-center gap-2 ${showFilters ? 'ring-2 ring-gray-300' : ''}`}
        >
          <Filter className="w-4 h-4" />
          فلتر
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pr-10"
            placeholder="ابحث عن حملة..."
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ArrowUpDown className="w-4 h-4" />
          <select
            value={filters.sort}
            onChange={(e) => { setFilters(f => ({ ...f, sort: e.target.value })); setPage(1); }}
            className="input-field !py-1.5 !px-3 !w-auto text-sm"
          >
            <option value="latest">الأحدث</option>
            <option value="highest_budget">الأعلى ميزانية</option>
            <option value="deadline">الأقرب انتهاءً</option>
          </select>
        </div>
        {hasActiveFilters && (
          <button onClick={resetFilters} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> إعادة تعيين
          </button>
        )}
      </div>

      {showFilters && (
        <div className="card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> فلتر متقدم
            </span>
            <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-black">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">الفئة</label>
              <select
                value={filters.category}
                onChange={(e) => { setFilters(f => ({ ...f, category: e.target.value })); setPage(1); }}
                className="input-field text-sm"
              >
                <option value="">كل الفئات</option>
                {CAMPAIGN_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">أقل ميزانية</label>
              <input
                type="number"
                value={filters.budget_min}
                onChange={(e) => { setFilters(f => ({ ...f, budget_min: e.target.value })); setPage(1); }}
                className="input-field text-sm"
                placeholder="$0"
                min={0}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">أعلى ميزانية</label>
              <input
                type="number"
                value={filters.budget_max}
                onChange={(e) => { setFilters(f => ({ ...f, budget_max: e.target.value })); setPage(1); }}
                className="input-field text-sm"
                placeholder="$10000"
                min={0}
              />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <CampaignListSkeleton count={6} />
        ) : filtered.length > 0 ? (
          filtered.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onApply={(c) => { setSelectedCampaign(c); setShowApplyModal(true); }}
            />
          ))
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">
              {search || hasActiveFilters ? 'لا توجد نتائج تطابق بحثك' : 'لا توجد حملات متاحة حاليًا'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {(search || hasActiveFilters)
                ? 'حاول تغيير معايير البحث أو إعادة تعيين الفلاتر'
                : 'سيكون لديك إشعار عند توفر حملات جديدة'}
            </p>
            {(search || hasActiveFilters) && (
              <button onClick={resetFilters} className="btn-secondary text-sm mt-4">
                إعادة تعيين الفلاتر
              </button>
            )}
          </div>
        )}
      </div>

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-gray-400">
            عرض {meta.from}-{meta.to} من {meta.total}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn-secondary !py-1.5 !px-3 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {Array.from({ length: meta.last_page }, (_, i) => i + 1)
              .filter(p => p === 1 || p === meta.last_page || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => (
                <span key={p} className="flex items-center">
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="px-1 text-gray-300">...</span>
                  )}
                  <button
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-black text-white'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
              disabled={page >= meta.last_page}
              className="btn-secondary !py-1.5 !px-3 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {showApplyModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">التقديم على الحملة</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500">{selectedCampaign.title}</p>
            <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg space-y-1">
              <span>الميزانية: ${selectedCampaign.budget}</span>
              {selectedCampaign.category && <span className="block">الفئة: {selectedCampaign.category}</span>}
              {selectedCampaign.end_date && (
                <span className="block">
                  آخر موعد: {new Date(selectedCampaign.end_date).toLocaleDateString('ar-IQ')}
                </span>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">المبلغ المقترح ($)</label>
              <input
                type="number"
                value={proposedRate}
                onChange={(e) => setProposedRate(e.target.value)}
                className="input-field"
                placeholder="أدخل المبلغ الذي تطلبه"
                min={0}
                max={selectedCampaign.budget}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">الاقتراح</label>
              <textarea
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
                className="input-field min-h-[120px]"
                placeholder="اكتب اقتراحك للمعلن... لماذا تختارك؟"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleApply}
                disabled={submitting || !proposal.trim() || !proposedRate}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {submitting ? 'جاري التقديم...' : 'تأكيد التقديم'}
              </button>
              <button onClick={() => setShowApplyModal(false)} className="btn-secondary flex-1">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
