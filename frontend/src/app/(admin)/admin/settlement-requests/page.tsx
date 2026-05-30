'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Toaster, toast } from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Send, Check, X, Eye, CreditCard } from 'lucide-react';
import { TableSkeleton } from '@/components/shared/Skeleton';

export default function AdminSettlementRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [reviewing, setReviewing] = useState<number | null>(null);

  const fetchRequests = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.set('status', filter);
    params.set('page', String(page));
    api.get(`/admin/settlement-requests?${params}`).then((r) => {
      setRequests(r.data.data || []);
      setMeta(r.data.meta);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, [page, filter]);

  const reviewSettlement = async (id: number, action: 'approve' | 'reject') => {
    setReviewing(id);
    try {
      const notes = action === 'reject' ? prompt('سبب الرفض:') : null;
      await api.post(`/admin/settlement-requests/${id}/process`, { action, admin_notes: notes });
      toast.success(action === 'approve' ? 'تمت الموافقة على طلب التسوية' : 'تم رفض طلب التسوية');
      fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setReviewing(null);
    }
  };

  const paymentMethodLabel: Record<string, string> = {
    zain_cash: 'Zain Cash',
    super_kay: 'Super Kay',
    fib: 'FIB',
    bank_transfer: 'تحويل بنكي',
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />
      <div>
        <h1 className="page-title">طلبات التسوية</h1>
        <p className="page-subtitle">مراجعة طلبات سحب الأرباح من المبدعين</p>
      </div>

      <div className="flex items-center gap-3">
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="input-field w-36">
          <option value="">الكل</option>
          <option value="pending">قيد المراجعة</option>
          <option value="approved">مقبول</option>
          <option value="rejected">مرفوض</option>
        </select>
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={7} />
      ) : (
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-right p-3 text-xs font-medium text-gray-500">المبدع</th>
                <th className="text-right p-3 text-xs font-medium text-gray-500">المبلغ</th>
                <th className="text-right p-3 text-xs font-medium text-gray-500">طريقة الدفع</th>
                <th className="text-right p-3 text-xs font-medium text-gray-500">رقم الدفع</th>
                <th className="text-right p-3 text-xs font-medium text-gray-500">الاسم</th>
                <th className="text-right p-3 text-xs font-medium text-gray-500">الحالة</th>
                <th className="text-right p-3 text-xs font-medium text-gray-500">التاريخ</th>
                <th className="text-right p-3 text-xs font-medium text-gray-500">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-400 text-sm">لا توجد طلبات تسوية</td></tr>
              ) : requests.map((req: any) => {
                const profile = req.user?.creator_profile;
                return (
                  <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-sm">{req.user?.name || '-'}</td>
                    <td className="p-3 text-sm font-medium">${Number(req.amount).toFixed(2)}</td>
                    <td className="p-3 text-sm text-gray-500">
                      {profile?.payment_method ? (
                        <span className="inline-flex items-center gap-1">
                          <CreditCard className="w-3 h-3" />
                          {paymentMethodLabel[profile.payment_method] || profile.payment_method}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="p-3 text-sm text-gray-500">{profile?.payment_phone || '-'}</td>
                    <td className="p-3 text-sm text-gray-500">{profile?.payment_name || '-'}</td>
                    <td className="p-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        req.status === 'approved' ? 'bg-green-50 text-green-700' :
                        req.status === 'rejected' ? 'bg-red-50 text-red-600' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {req.status === 'approved' ? 'مقبول' : req.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-gray-400">{formatDate(req.created_at)}</td>
                    <td className="p-3">
                      {req.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => reviewSettlement(req.id, 'approve')}
                            disabled={reviewing === req.id}
                            className="inline-flex items-center gap-1 bg-black text-white text-xs px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                          >
                            <Check className="w-3 h-3" />
                            قبول
                          </button>
                          <button
                            onClick={() => reviewSettlement(req.id, 'reject')}
                            disabled={reviewing === req.id}
                            className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            <X className="w-3 h-3" />
                            رفض
                          </button>
                        </div>
                      )}
                      {req.admin_notes && (
                        <p className="text-[10px] text-gray-400 mt-1">ملاحظة: {req.admin_notes}</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
