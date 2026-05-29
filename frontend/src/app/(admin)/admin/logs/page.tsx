'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Toaster, toast } from 'react-hot-toast';
import { ArrowRight, ArrowLeft, Activity, Shield } from 'lucide-react';
import Link from 'next/link';
import { TableSkeleton } from '@/components/shared/Skeleton';

export default function AdminLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/logs?page=${page}`)
      .then((r) => {
        setLogs(r.data.data || []);
        setHasMore(r.data.next_page_url !== null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const actionLabels: Record<string, string> = {
    update_user: 'تحديث مستخدم',
    update_campaign_status: 'تحديث حالة حملة',
    release_payment: 'صرف دفعة',
    refund_payment: 'استرداد دفعة',
    review_kyc: 'مراجعة توثيق',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="page-title">سجل النشاطات</h1>
          <p className="page-subtitle">جميع الإجراءات التي قام بها الإداريون</p>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={4} />
      ) : (
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-right p-3 text-xs font-medium text-gray-500">الإداري</th>
              <th className="text-right p-3 text-xs font-medium text-gray-500">الإجراء</th>
              <th className="text-right p-3 text-xs font-medium text-gray-500">التفاصيل</th>
              <th className="text-right p-3 text-xs font-medium text-gray-500">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? (
              logs.map((log: any, i: number) => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-xs font-bold text-white">
                        {log.admin?.name?.[0] || '?'}
                      </div>
                      <span className="text-sm">{log.admin?.name || 'غير معروف'}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                      <Shield className="w-3 h-3" />
                      {actionLabels[log.action] || log.action}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-gray-500 max-w-[200px] truncate">
                    {log.metadata ? JSON.stringify(log.metadata) : '-'}
                  </td>
                  <td className="p-3 text-xs text-gray-400">{formatDate(log.created_at)}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="p-6 text-center text-gray-400 text-sm">لا توجد نشاطات</td></tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="btn-secondary text-sm"
            disabled={loading}
          >
            {loading ? 'جاري التحميل...' : 'عرض المزيد'}
          </button>
        </div>
      )}
    </div>
  );
}
