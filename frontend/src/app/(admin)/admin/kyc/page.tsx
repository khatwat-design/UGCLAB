'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Badge from '@/components/shared/Badge';
import { formatDate } from '@/lib/utils';
import { Toaster, toast } from 'react-hot-toast';
import { Search, ChevronLeft, ChevronRight, FileText, CheckCircle, XCircle, Shield, ExternalLink } from 'lucide-react';
import { KycSkeleton } from '@/components/shared/Skeleton';

const kycLabels: Record<string, string> = {
  not_submitted: 'لم يقدم',
  pending: 'قيد المراجعة',
  verified: 'موثق',
  rejected: 'مرفوض',
};

const docTypeLabels: Record<string, string> = {
  id_card: 'بطاقة هوية',
  passport: 'جواز سفر',
  business_license: 'سجل تجاري',
  portfolio: 'أعمال سابقة',
};

export default function AdminKyc() {
  const [users, setUsers] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewing, setReviewing] = useState<number | null>(null);
  const [tab, setTab] = useState<'pending' | 'all'>('pending');

  const fetchUsers = () => {
    setLoading(true);
    const doFetch = (p: Promise<any>) => {
      p.then((r) => {
        setUsers(r.data.data);
        setMeta(r.data.meta);
      }).finally(() => setLoading(false));
    };
    if (tab === 'pending') {
      doFetch(api.get('/admin/kyc/pending'));
    } else {
      const params = new URLSearchParams();
      if (filter) params.set('kyc_status', filter);
      if (roleFilter) params.set('role', roleFilter);
      if (search) params.set('search', search);
      params.set('page', String(page));
      doFetch(api.get(`/admin/kyc/users?${params}`));
    }
  };

  useEffect(() => { fetchUsers(); }, [page, filter, roleFilter, search, tab]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const reviewDoc = async (docId: number, status: string) => {
    setReviewing(docId);
    try {
      await api.post(`/admin/kyc/${docId}/review`, { status, admin_notes: reviewNotes });
      toast.success(status === 'approved' ? 'تم توثيق المستند' : 'تم رفض المستند');
      setReviewNotes('');
      setSelectedUser(null);
      fetchUsers();
    } catch { toast.error('حدث خطأ'); }
    finally { setReviewing(null); }
  };

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  const getBackendUrl = (_path: string, docId: number) => `${apiBase}/kyc/documents/${docId}`;

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />
      <div>
        <h1 className="page-title">توثيق الحسابات</h1>
        <p className="page-subtitle">مراجعة وثائق المستخدمين وتوثيق حساباتهم</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => { setTab('pending'); setPage(1); }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            tab === 'pending' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
          }`}
        >
          بانتظار المراجعة
        </button>
        <button
          onClick={() => { setTab('all'); setPage(1); }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            tab === 'all' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
          }`}
        >
          جميع المستخدمين
        </button>
      </div>

      {tab === 'all' && (
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
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field w-36">
            <option value="">جميع الحالات</option>
            <option value="not_submitted">لم يقدم</option>
            <option value="pending">قيد المراجعة</option>
            <option value="verified">موثق</option>
            <option value="rejected">مرفوض</option>
          </select>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field w-32">
            <option value="">الكل</option>
            <option value="creator">مبدع</option>
            <option value="advertiser">معلن</option>
          </select>
        </div>
      )}

      {/* User Cards */}
      {loading ? (
        <KycSkeleton />
      ) : (<>
      <div className="space-y-3">
        {users.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Shield className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">
              {tab === 'pending' ? 'لا توجد طلبات توثيق معلقة' : 'لا يوجد مستخدمين'}
            </p>
          </div>
        ) : users.map((user: any) => (
          <div key={user.id} className="card hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-lg font-bold text-white shrink-0">
                    {user.name?.[0] || '?'}
                  </div>
                )}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-black">{user.name}</h3>
                    <Badge status={user.role} />
                  </div>
                  <p className="text-xs text-gray-400">{user.email}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={`font-medium px-2 py-0.5 rounded-full border ${
                      user.kyc_status === 'verified' ? 'text-green-600 border-green-200 bg-green-50' :
                      user.kyc_status === 'rejected' ? 'text-red-600 border-red-200 bg-red-50' :
                      user.kyc_status === 'pending' ? 'text-amber-600 border-amber-200 bg-amber-50' :
                      'text-gray-400 border-gray-200 bg-gray-50'
                    }`}>
                      {kycLabels[user.kyc_status] || 'لم يقدم'}
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className="text-gray-400">{formatDate(user.created_at)}</span>
                  </div>
                  {user.kycDocuments?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {user.kycDocuments.map((doc: any) => (
                        <span key={doc.id} className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${
                          doc.status === 'approved' ? 'border-green-200 text-green-600 bg-green-50' :
                          doc.status === 'rejected' ? 'border-red-200 text-red-600 bg-red-50' :
                          'border-amber-200 text-amber-600 bg-amber-50'
                        }`}>
                          <FileText className="w-3 h-3" />
                          {docTypeLabels[doc.document_type] || doc.document_type}
                          {doc.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                          {doc.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                className="btn-secondary text-sm shrink-0 mr-4"
              >
                {selectedUser?.id === user.id ? 'إغلاق' : 'مراجعة'}
              </button>
            </div>

            {/* Review Panel */}
            {selectedUser?.id === user.id && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-bold text-black mb-3">الوثائق المرفوعة</h4>
                {!user.kycDocuments || user.kycDocuments.length === 0 ? (
                  <p className="text-xs text-gray-400">لم يتم رفع أي وثائق</p>
                ) : (
                  <div className="space-y-3">
                    {user.kycDocuments.map((doc: any) => (
                      <div key={doc.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-black">
                              {docTypeLabels[doc.document_type] || doc.document_type}
                            </span>
                            <Badge status={doc.status} />
                          </div>
                          <a
                            href={getBackendUrl(doc.file_path, doc.id)}
                            target="_blank"
                            className="text-xs text-gray-500 hover:text-black inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> عرض
                          </a>
                        </div>
                        <p className="text-xs text-gray-400 mb-1">{doc.original_name}</p>
                        {doc.admin_notes && (
                          <p className="text-xs text-gray-500 bg-white p-2 rounded border border-gray-100">
                            ملاحظات: {doc.admin_notes}
                          </p>
                        )}
                        {doc.status === 'pending' && (
                          <div className="flex items-center gap-2 mt-3">
                            <input
                              type="text"
                              value={reviewNotes}
                              onChange={(e) => setReviewNotes(e.target.value)}
                              className="input-field flex-1 text-sm"
                              placeholder="ملاحظات (اختياري)..."
                            />
                            <button
                              onClick={() => reviewDoc(doc.id, 'approved')}
                              disabled={reviewing === doc.id}
                              className="btn-primary text-xs inline-flex items-center gap-1 disabled:opacity-50"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> توثيق
                            </button>
                            <button
                              onClick={() => reviewDoc(doc.id, 'rejected')}
                              disabled={reviewing === doc.id}
                              className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" /> رفض
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

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
      </>)}
    </div>
  );
}
