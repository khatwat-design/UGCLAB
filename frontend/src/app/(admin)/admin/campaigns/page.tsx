'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Badge from '@/components/shared/Badge';
import { formatDate } from '@/lib/utils';
import { Toaster, toast } from 'react-hot-toast';
import { Search, ChevronLeft, ChevronRight, Megaphone } from 'lucide-react';
import { CampaignListSkeleton } from '@/components/shared/Skeleton';

const statusOptions = [
  { value: '', label: 'الكل' },
  { value: 'draft', label: 'مسودة' },
  { value: 'open', label: 'مفتوح' },
  { value: 'active', label: 'نشط' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'cancelled', label: 'ملغي' },
];

const nextStatus: Record<string, string[]> = {
  draft: ['open'],
  open: ['active'],
  active: ['completed'],
};

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchCampaigns = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.set('status', filter);
    if (search) params.set('search', search);
    params.set('page', String(page));
    api.get(`/admin/campaigns?${params}`).then((r) => {
      setCampaigns(r.data.data);
      setMeta(r.data.meta);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCampaigns(); }, [page, filter, search]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/admin/campaigns/${id}/status`, { status });
      toast.success('تم تحديث حالة الحملة');
      fetchCampaigns();
    } catch { toast.error('حدث خطأ'); }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />
      <div>
        <h1 className="page-title">الحملات</h1>
        <p className="page-subtitle">إدارة ومراقبة جميع الحملات</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="input-field pr-10"
            placeholder="ابحث عن حملة..."
          />
        </div>
        <button onClick={handleSearch} className="btn-primary text-sm">بحث</button>
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="input-field w-36">
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <CampaignListSkeleton count={5} />
      ) : (
      <div className="space-y-3">
        {campaigns.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Megaphone className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">لا توجد حملات</p>
          </div>
        ) : campaigns.map((campaign: any, i: number) => (
          <div key={campaign.id} className="card hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-black">{campaign.title}</h3>
                  <Badge status={campaign.status} />
                </div>
                <p className="text-xs text-gray-400">بواسطة: {campaign.advertiser?.name || 'غير معروف'}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                  <span>الميزانية: ${campaign.budget}</span>
                  <span>{campaign.applications_count || 0} متقدم</span>
                  <span>{formatDate(campaign.created_at)}</span>
                  {campaign.description && (
                    <span className="line-clamp-1 text-gray-400 max-w-xs">{campaign.description}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0 mr-4">
                {nextStatus[campaign.status]?.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(campaign.id, s)}
                    className="btn-primary text-xs"
                  >
                    {s === 'open' ? 'فتح' : s === 'active' ? 'تفعيل' : s === 'completed' ? 'إكمال' : s}
                  </button>
                ))}
                {campaign.status !== 'completed' && campaign.status !== 'cancelled' && (
                  <button
                    onClick={() => updateStatus(campaign.id, 'cancelled')}
                    className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary text-sm disabled:opacity-30 inline-flex items-center gap-1"
          >
            <ChevronRight className="w-4 h-4" /> السابق
          </button>
          <span className="text-xs text-gray-400">
            صفحة {meta.current_page} من {meta.last_page}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
            disabled={page === meta.last_page}
            className="btn-secondary text-sm disabled:opacity-30 inline-flex items-center gap-1"
          >
            التالي <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
