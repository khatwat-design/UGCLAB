'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Badge from '@/components/shared/Badge';
import { formatDate } from '@/lib/utils';
import { Toaster, toast } from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Wallet, DollarSign, BarChart3 } from 'lucide-react';
import StatsCard from '@/components/shared/StatsCard';
import { StatsRowSkeleton, TableSkeleton } from '@/components/shared/Skeleton';

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [summary, setSummary] = useState<null | { held: number; released: number; fees: number }>(null);

  const fetchPayments = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.set('status', filter);
    params.set('page', String(page));
    api.get(`/admin/payments?${params}`).then((r) => {
      setPayments(r.data.data);
      setMeta(r.data.meta);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPayments(); }, [page, filter]);

  useEffect(() => {
    api.get('/admin/dashboard').then((r) => {
      setSummary({
        held: r.data.total_payments_held || 0,
        released: r.data.total_payments_released || 0,
        fees: r.data.platform_revenue || 0,
      });
    }).catch(() => {});
  }, []);

  const releasePayment = async (id: number) => {
    try {
      await api.post(`/admin/payments/${id}/release`);
      toast.success('تم صرف الدفعة');
      fetchPayments();
    } catch { toast.error('حدث خطأ'); }
  };

  const refundPayment = async (id: number) => {
    try {
      await api.post(`/admin/payments/${id}/refund`);
      toast.success('تم استرجاع الدفعة');
      fetchPayments();
    } catch { toast.error('حدث خطأ'); }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />
      <div>
        <h1 className="page-title">المدفوعات</h1>
        <p className="page-subtitle">إدارة ومراقبة المدفوعات على المنصة</p>
      </div>

      {summary ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard title="المدفوعات المعلقة" value={`$${Number(summary.held).toFixed(2)}`}
            icon={<Wallet className="w-4 h-4 text-gray-600" />} />
          <StatsCard title="المدفوعات المصروفة" value={`$${Number(summary.released).toFixed(2)}`}
            icon={<DollarSign className="w-4 h-4 text-gray-600" />} />
          <StatsCard title="إيرادات المنصة" value={`$${Number(summary.fees).toFixed(2)}`}
            icon={<BarChart3 className="w-4 h-4 text-gray-600" />} />
        </div>
      ) : (
        <StatsRowSkeleton count={3} />
      )}

      <div className="flex items-center gap-3">
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="input-field w-36">
          <option value="">الكل</option>
          <option value="held">معلق</option>
          <option value="released">مصروف</option>
          <option value="refunded">مسترجع</option>
        </select>
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={8} />
      ) : (
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-right p-3 text-xs font-medium text-gray-500">المعلن</th>
                <th className="text-right p-3 text-xs font-medium text-gray-500">المبدع</th>
                <th className="text-right p-3 text-xs font-medium text-gray-500">المبلغ</th>
                <th className="text-right p-3 text-xs font-medium text-gray-500">رسوم المنصة</th>
                <th className="text-right p-3 text-xs font-medium text-gray-500">الصافي</th>
                <th className="text-right p-3 text-xs font-medium text-gray-500">الحالة</th>
                <th className="text-right p-3 text-xs font-medium text-gray-500">التاريخ</th>
                <th className="text-right p-3 text-xs font-medium text-gray-500">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-400 text-sm">لا توجد مدفوعات</td></tr>
              ) : payments.map((payment: any) => (
                <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-3 text-sm">{payment.advertiser?.name || '-'}</td>
                  <td className="p-3 text-sm">{payment.creator?.name || '-'}</td>
                  <td className="p-3 text-sm font-medium">${Number(payment.amount).toFixed(2)}</td>
                  <td className="p-3 text-sm text-gray-500">${Number(payment.platform_fee || 0).toFixed(2)}</td>
                  <td className="p-3 text-sm font-medium text-green-600">
                    ${(Number(payment.amount) - Number(payment.platform_fee || 0)).toFixed(2)}
                  </td>
                  <td className="p-3"><Badge status={payment.status} /></td>
                  <td className="p-3 text-xs text-gray-400">{formatDate(payment.created_at)}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {payment.status === 'held' && (
                        <>
                          <button onClick={() => releasePayment(payment.id)} className="btn-primary text-xs">
                            صرف
                          </button>
                          <button onClick={() => refundPayment(payment.id)} className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                            استرجاع
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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
