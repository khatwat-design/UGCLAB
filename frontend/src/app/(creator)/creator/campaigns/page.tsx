'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Badge from '@/components/shared/Badge';
import { Toaster, toast } from 'react-hot-toast';
import { Search, X } from 'lucide-react';
import { CardGridSkeleton } from '@/components/shared/Skeleton';

export default function CreatorCampaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [proposal, setProposal] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCampaigns = () => {
    setLoading(true);
    api.get('/creator/campaigns').then((r) => setCampaigns(r.data.data)).catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const handleApply = async () => {
    if (!proposal.trim() || !proposedRate) return;
    setSubmitting(true);
    try {
      await api.post(`/creator/campaigns/${selectedCampaign.id}/apply`, {
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

  const filtered = campaigns.filter((c) =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />
      <div>
        <h1 className="page-title">الحملات المتاحة</h1>
        <p className="page-subtitle">تصفح الحملات المناسبة لك وتقدم لها</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pr-10"
          placeholder="ابحث عن حملة..."
        />
      </div>

      <div className="grid gap-4">
        {loading ? (
          <CardGridSkeleton count={4} />
        ) : filtered.length > 0 ? (
          filtered.map((campaign: any) => (
            <div key={campaign.id} className="card hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1 min-w-0">
                  <h3 className="font-bold text-black">{campaign.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{campaign.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                    <span>الميزانية: ${campaign.budget}</span>
                    {campaign.category && <span>الفئة: {campaign.category}</span>}
                    {campaign.deadline && (
                      <span>آخر موعد: {new Date(campaign.deadline).toLocaleDateString('ar-IQ')}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    {campaign.requirements && (
                      <span className="text-[11px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                        {campaign.requirements}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedCampaign(campaign); setShowApplyModal(true); }}
                  className="btn-primary text-sm shrink-0 mr-4"
                >
                  تقدم الآن
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 py-8">
            {search ? 'لا توجد نتائج للبحث' : 'لا توجد حملات متاحة حاليًا'}
          </p>
        )}
      </div>

      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">التقديم على الحملة</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500">{selectedCampaign?.title}</p>
            <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg">
              <span>الميزانية: ${selectedCampaign?.budget}</span>
              {selectedCampaign?.category && <span className="mr-3">الفئة: {selectedCampaign?.category}</span>}
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
                max={selectedCampaign?.budget}
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
