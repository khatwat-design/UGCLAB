'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Badge from '@/components/shared/Badge';
import { formatDate } from '@/lib/utils';
import { Toaster, toast } from 'react-hot-toast';
import { Search, ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import { TableSkeleton } from '@/components/shared/Skeleton';

const kycLabels: Record<string, string> = {
  not_submitted: 'لم يقدم',
  pending: 'قيد المراجعة',
  verified: 'موثق',
  rejected: 'مرفوض',
};

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.set('role', filter);
    if (search) params.set('search', search);
    params.set('page', String(page));
    api.get(`/admin/users?${params}`).then((r) => {
      setUsers(r.data.data);
      setMeta(r.data.meta);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page, filter, search]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const toggleUserStatus = async (user: any) => {
    try {
      await api.put(`/admin/users/${user.id}`, { is_active: !user.is_active });
      toast.success('تم تحديث حالة المستخدم');
      fetchUsers();
    } catch { toast.error('حدث خطأ'); }
  };

  const updateKyc = async (user: any, status: string) => {
    try {
      await api.put(`/admin/users/${user.id}`, { kyc_status: status });
      toast.success('تم تحديث حالة التوثيق');
      fetchUsers();
    } catch { toast.error('حدث خطأ'); }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />
      <div>
        <h1 className="page-title">المستخدمين</h1>
        <p className="page-subtitle">إدارة مستخدمي المنصة</p>
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
            placeholder="بحث بالاسم أو البريد..."
          />
        </div>
        <button onClick={handleSearch} className="btn-primary text-sm">بحث</button>
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="input-field w-36">
          <option value="">جميع الأنواع</option>
          <option value="creator">مبدعين</option>
          <option value="advertiser">معلنين</option>
          <option value="admin">إداريين</option>
        </select>
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : (
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-right p-3 text-xs font-medium text-gray-500">الاسم</th>
                <th className="text-right p-3 text-xs font-medium text-gray-500">البريد</th>
                <th className="text-right p-3 text-xs font-medium text-gray-500">النوع</th>
                <th className="text-right p-3 text-xs font-medium text-gray-500">توثيق</th>
                <th className="text-right p-3 text-xs font-medium text-gray-500">الحالة</th>
                <th className="text-right p-3 text-xs font-medium text-gray-500">التسجيل</th>
                <th className="text-right p-3 text-xs font-medium text-gray-500">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-400 text-sm">لا يوجد مستخدمين</td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-3 text-sm font-medium">{user.name}</td>
                  <td className="p-3 text-sm text-gray-500">{user.email}</td>
                  <td className="p-3"><Badge status={user.role} /></td>
                  <td className="p-3">
                    <select
                      value={user.kyc_status || 'not_submitted'}
                      onChange={(e) => updateKyc(user, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white"
                    >
                      {Object.entries(kycLabels).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${
                      user.is_active ? 'text-green-600 border-green-200 bg-green-50' : 'text-red-600 border-red-200 bg-red-50'
                    }`}>
                      {user.is_active ? 'نشط' : 'موقوف'}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-gray-400">{formatDate(user.created_at)}</td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleUserStatus(user)}
                      className={`text-xs px-3 py-1 rounded-lg border transition-colors ${
                        user.is_active
                          ? 'text-red-600 border-red-200 hover:bg-red-50'
                          : 'text-green-600 border-green-200 hover:bg-green-50'
                      }`}
                    >
                      {user.is_active ? 'إيقاف' : 'تفعيل'}
                    </button>
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
