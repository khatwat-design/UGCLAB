'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import Badge from '@/components/shared/Badge';
import { formatDate } from '@/lib/utils';
import { Toaster, toast } from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Upload, Film, FileText } from 'lucide-react';
import { AppListSkeleton } from '@/components/shared/Skeleton';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function CreatorApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [contentUrl, setContentUrl] = useState('');
  const [contentType, setContentType] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaId, setMediaId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchApplications = (p: number) => {
    setLoading(true);
    api.get(`/creator/applications?page=${p}`).then((r) => {
      setApplications(r.data.data);
      setMeta(r.data.meta);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchApplications(page); }, [page]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('collection', 'deliverable');
      const res = await api.post('/media/upload', formData);
      const media = res.data;
      setMediaId(media.id);
      setContentUrl(media.url);
      setContentType(media.is_video ? 'video' : file.type.startsWith('image/') ? 'image' : 'file');
      toast.success('تم رفع الملف');
    } catch {
      toast.error('فشل رفع الملف');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const submitDeliverable = async (appId: number) => {
    if ((!contentUrl.trim() || !contentType.trim()) && !mediaId) return;
    setSubmitting(true);
    try {
      const payload: any = { content_type: contentType, notes };
      if (mediaId) {
        payload.media_id = mediaId;
      } else {
        payload.content_url = contentUrl;
      }
      await api.post(`/creator/deliverables/${appId}`, payload);
      toast.success('تم تسليم المحتوى بنجاح');
      setShowModal(false);
      setContentUrl('');
      setContentType('');
      setNotes('');
      setMediaId(null);
      fetchApplications(page);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  };

  const openDeliverableModal = (app: any) => {
    setSelectedApp(app);
    setContentUrl('');
    setContentType('');
    setNotes('');
    setMediaId(null);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />
      <div>
        <h1 className="page-title">طلباتي</h1>
        <p className="page-subtitle">حالة طلبات التقديم على الحملات</p>
      </div>

      {loading ? (
        <AppListSkeleton count={5} />
      ) : applications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-sm text-gray-400">لم تتقدم لأي حملة بعد</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {applications.map((app: any) => (
              <div key={app.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1 min-w-0">
                    <h3 className="font-bold text-black">{app.campaign?.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{app.proposal}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                      <span>المبلغ المقترح: ${app.proposed_rate}</span>
                      <span>{formatDate(app.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0 mr-4">
                    <Badge status={app.status} />
                    {(app.status === 'accepted' || app.status === 'revision_requested') && (
                      <button
                        onClick={() => openDeliverableModal(app)}
                        className="btn-primary text-sm"
                      >
                        تسليم المحتوى
                      </button>
                    )}
                  </div>
                </div>
                {app.deliverables?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      تم التسليم: {formatDate(app.deliverables[0].submitted_at)}
                    </span>
                    <Badge status={app.deliverables[0].status} className="!text-[10px]" />
                    {app.deliverables[0].content_url && (
                      <a
                        href={app.deliverables[0].content_url}
                        target="_blank"
                        className="text-xs text-black underline hover:no-underline"
                      >
                        عرض المحتوى
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
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
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 space-y-4">
            <h3 className="text-lg font-bold">تسليم المحتوى</h3>
            <p className="text-sm text-gray-500">{selectedApp?.campaign?.title}</p>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-gray-300 transition-colors"
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <LoadingSpinner className="h-8 w-auto" />
                  <span className="text-xs text-gray-400">جاري الرفع...</span>
                </div>
              ) : contentUrl ? (
                <div className="relative">
                  {contentType === 'video' ? (
                    <video src={contentUrl} className="max-h-32 mx-auto rounded-lg" controls />
                  ) : (
                    <div className="flex items-center gap-2 justify-center">
                      <FileText className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-gray-600">تم رفع الملف</span>
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); setContentUrl(''); setMediaId(null); }}
                    className="mt-2 text-xs text-red-500 hover:text-red-700"
                  >
                    حذف وإعادة رفع
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-gray-300" />
                  <span className="text-sm text-gray-400">اضغط لرفع ملف المحتوى</span>
                  <span className="text-[10px] text-gray-300">فيديو، صورة، PDF - حد 100MB</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,image/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileSelect}
            />

            <input
              type="text"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="input-field"
              placeholder="نوع المحتوى (مثال: video, image, article)"
            />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field min-h-[80px]"
              placeholder="ملاحظات إضافية"
            />
            <div className="flex gap-3">
              <button
                onClick={() => submitDeliverable(selectedApp.id)}
                disabled={submitting || uploading || (!contentUrl.trim() && !mediaId) || !contentType.trim()}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {submitting ? 'جاري التسليم...' : 'تأكيد التسليم'}
              </button>
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
