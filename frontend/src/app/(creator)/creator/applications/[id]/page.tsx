'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import {
  ArrowRight, ArrowLeft, DollarSign, Calendar, Check, X, Clock,
  FileText, ExternalLink, Upload, MessageSquare, User, Truck,
  RefreshCw, Eye, ThumbsUp, ChevronRight, MessageCircle, Send,
  Film, Image as ImageIcon, Link2,
} from 'lucide-react';
import { CampaignDetailSkeleton } from '@/components/shared/Skeleton';

const appStatusConfig: Record<string, { label: string; classes: string }> = {
  pending: { label: 'بانتظار المراجعة', classes: 'bg-gray-100 text-gray-600' },
  accepted: { label: 'مقبول', classes: 'bg-black text-white' },
  rejected: { label: 'مرفوض', classes: 'bg-gray-100 text-gray-400' },
  revision_requested: { label: 'طلب تعديل', classes: 'bg-amber-50 text-amber-700' },
  completed: { label: 'مكتمل', classes: 'bg-gray-100 text-gray-500' },
};

const shippingConfig: Record<string, { label: string; classes: string }> = {
  not_shipped: { label: 'لم يتم الشحن', classes: 'bg-gray-100 text-gray-400' },
  awaiting_shipment: { label: 'بانتظار الشحن', classes: 'bg-amber-50 text-amber-700' },
  shipped: { label: 'تم الشحن', classes: 'bg-blue-50 text-blue-700' },
  received: { label: 'تم الاستلام', classes: 'bg-green-50 text-green-700' },
};

const statusWorkflow = [
  { key: 'pending', label: 'قيد المراجعة' },
  { key: 'accepted', label: 'مقبول' },
  { key: 'revision_requested', label: 'طلب تعديل' },
  { key: 'in_progress', label: 'قيد التنفيذ' },
  { key: 'completed', label: 'مكتمل' },
];

export default function CreatorApplicationDetail() {
  const { id } = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Deliverable submission
  const [submitting, setSubmitting] = useState(false);
  const [contentType, setContentType] = useState('video');
  const [contentUrl, setContentUrl] = useState('');
  const [deliverableNotes, setDeliverableNotes] = useState('');
  const [uploadedMediaId, setUploadedMediaId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  // Messages
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get(`/creator/applications/${id}`).then((r) => {
      setApplication(r.data);
    }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (application?.campaign?.id) {
      const otherId = application.campaign.advertiser_id;
      api.get(`/messages/conversation/${otherId}?campaign_id=${application.campaign.id}`)
        .then((r) => setMessages(r.data || []))
        .catch(() => {});
    }
  }, [application]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const refresh = () => {
    api.get(`/creator/applications/${id}`).then((r) => setApplication(r.data));
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/media/upload', formData);
      setUploadedMediaId(res.data.id);
      setContentUrl(res.data.url);
      const isVideo = file.type.startsWith('video/');
      setContentType(isVideo ? 'video' : 'image');
      toast.success('تم رفع الملف بنجاح');
    } catch {
      toast.error('فشل رفع الملف');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const submitDeliverable = async () => {
    if (!contentUrl && !uploadedMediaId) {
      toast.error('الرجاء رفع ملف أو إدخال رابط');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/creator/deliverables/${application.id}`, {
        content_url: contentUrl || undefined,
        content_type: contentType,
        notes: deliverableNotes || undefined,
        media_id: uploadedMediaId || undefined,
      });
      toast.success('تم تسليم المحتوى بنجاح');
      setContentUrl('');
      setDeliverableNotes('');
      setUploadedMediaId(null);
      refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  };

  const markReceived = async () => {
    try {
      await api.post(`/creator/applications/${application.id}/mark-received`);
      toast.success('تم تأكيد الاستلام');
      refresh();
    } catch {
      toast.error('حدث خطأ');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    setSendingMessage(true);
    try {
      const res = await api.post('/messages', {
        receiver_id: application.campaign.advertiser_id,
        campaign_id: application.campaign_id,
        content: newMessage,
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
    } catch {
      toast.error('فشل إرسال الرسالة');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading || !application) {
    return (
      <div className="max-w-5xl mx-auto">
        <CampaignDetailSkeleton />
      </div>
    );
  }

  const campaign = application.campaign || {};
  const appStatus = appStatusConfig[application.status] || appStatusConfig.pending;
  const currentStepIndex = statusWorkflow.findIndex((s) => {
    if (s.key === 'pending') return application.status === 'pending';
    if (s.key === 'accepted') return application.status === 'accepted';
    if (s.key === 'revision_requested') return application.status === 'revision_requested';
    if (s.key === 'in_progress') return application.status === 'accepted';
    if (s.key === 'completed') return application.status === 'completed';
    return false;
  });

  const isAccepted = application.status === 'accepted';
  const isRevisionRequested = application.status === 'revision_requested';
  const isCompleted = application.status === 'completed';
  const canSubmitDeliverable = isAccepted || isRevisionRequested;

  const advertiser = campaign.advertiser || {};
  const deliverables = application.deliverables || [];
  const latestDeliverable = deliverables[deliverables.length - 1];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Toaster position="top-center" />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <button
          onClick={() => router.push('/creator/applications')}
          className="p-2 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-black">{campaign.title}</h1>
            <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${appStatus.classes}`}>
              {appStatus.label}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            {campaign.category && <>{campaign.category} · </>}
            {new Date(campaign.created_at).toLocaleDateString('ar-IQ')}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
      >
        <p className="text-sm text-gray-700 leading-relaxed">{campaign.description}</p>
        {campaign.brief && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-bold text-black">ملخص الحملة (Brief)</h3>
            </div>
            <p className="text-sm text-gray-600">{campaign.brief}</p>
          </div>
        )}

        {/* Demographic targeting info */}
        {campaign.target_gender || campaign.target_age_min || campaign.videos_per_creator ? (
          <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
            {campaign.target_gender && (
              <span className="text-[11px] text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                الجنس المستهدف: {campaign.target_gender === 'male' ? 'ذكر' : campaign.target_gender === 'female' ? 'أنثى' : 'الكل'}
              </span>
            )}
            {(campaign.target_age_min || campaign.target_age_max) && (
              <span className="text-[11px] text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                الفئة العمرية: {campaign.target_age_min || '—'} - {campaign.target_age_max || '—'}
              </span>
            )}
            {campaign.videos_per_creator && (
              <span className="text-[11px] text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                عدد الفيديوهات: {campaign.videos_per_creator}
              </span>
            )}
          </div>
        ) : null}

        <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              الميزانية: <strong className="text-black">${campaign.budget}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              السعر المتفق: <strong className="text-black">${application.proposed_rate}</strong>
            </span>
            {campaign.start_date && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(campaign.start_date).toLocaleDateString('ar-IQ')}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Proposal section */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">الاقتراح</h3>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-700">{application.proposal}</p>
        </div>
        {application.revision_notes && (
          <div className="mt-3 bg-amber-50 rounded-lg p-4 border border-amber-100">
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-bold text-amber-700">ملاحظات التعديل</h4>
            </div>
            <p className="text-sm text-amber-800">{application.revision_notes}</p>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">مسار الطلب</h3>
        </div>
        <div className="flex items-center gap-0">
          {statusWorkflow.map((step, i) => {
            const isDone = i < currentStepIndex || application.status === 'completed';
            const isCurrent = i === currentStepIndex && !isDone;
            return (
              <div key={step.key} className="flex-1 flex flex-col items-center relative">
                <div
                  className={`w-full h-0.5 absolute top-3 -right-1/2 ${isDone || (isCurrent && i > 0) ? 'bg-black' : 'bg-gray-100'}`}
                  style={{ display: i === 0 ? 'none' : 'block' }}
                />
                <div
                  className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                    isDone ? 'bg-black text-white' : isCurrent ? 'bg-black text-white ring-2 ring-gray-200' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isDone ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <p className={`text-[10px] mt-2 ${isCurrent ? 'text-black font-bold' : 'text-gray-400'}`}>{step.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200">
        {[
          { key: 'overview', label: 'نظرة عامة' },
          { key: 'deliverables', label: 'التسليمات', count: deliverables.length },
          { key: 'messages', label: 'المحادثة', count: messages.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === tab.key ? 'text-black border-black' : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-black mb-4">تفاصيل الحساب</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[11px] text-gray-500 font-medium mb-1">المعلن</p>
                  <div className="flex items-center gap-2">
                    {advertiser.avatar ? (
                      <img src={advertiser.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-xs font-bold text-white">
                        {advertiser.name?.[0] || '?'}
                      </div>
                    )}
                    <p className="text-sm text-black font-medium">{advertiser.name}</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[11px] text-gray-500 font-medium mb-1">الاقتراح المقدم</p>
                  <p className="text-sm text-black font-medium">${application.proposed_rate}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'deliverables' && (
          <motion.div
            key="deliverables"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Submit deliverable */}
            {canSubmitDeliverable && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 p-5"
              >
                <h3 className="text-sm font-bold text-black mb-3">تسليم المحتوى</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600 hover:border-gray-400 transition-all w-full"
                    >
                      <Upload className="w-4 h-4" />
                      {uploading ? 'جاري الرفع...' : contentUrl ? 'تم رفع ملف' : 'اضغط لرفع ملف فيديو أو صورة'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*,image/*,.pdf"
                      className="hidden"
                      onChange={handleMediaUpload}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 border-t border-gray-200" />
                    <span className="text-xs text-gray-400">أو</span>
                    <div className="flex-1 border-t border-gray-200" />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">رابط المحتوى (URL)</label>
                    <input
                      type="url"
                      value={contentUrl}
                      onChange={(e) => setContentUrl(e.target.value)}
                      className="input-field text-sm"
                      placeholder="https://example.com/video.mp4"
                      dir="ltr"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">نوع المحتوى</label>
                      <select value={contentType} onChange={(e) => setContentType(e.target.value)} className="input-field text-sm">
                        <option value="video">فيديو</option>
                        <option value="image">صورة</option>
                        <option value="article">مقال</option>
                        <option value="audio">صوت</option>
                        <option value="other">أخرى</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">ملاحظات (اختياري)</label>
                    <textarea
                      value={deliverableNotes}
                      onChange={(e) => setDeliverableNotes(e.target.value)}
                      className="input-field text-sm min-h-[60px]"
                      placeholder="أضف ملاحظات حول التسليم..."
                    />
                  </div>

                  {contentUrl && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      {contentUrl.match(/\.(mp4|mov|avi|webm)(\?|$)/i) || contentType === 'video' ? (
                        <video src={contentUrl} controls className="w-full max-h-40 rounded-lg" />
                      ) : contentUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i) || contentType === 'image' ? (
                        <img src={contentUrl} alt="" className="w-full max-h-40 object-contain rounded-lg" />
                      ) : (
                        <a href={contentUrl} target="_blank" className="inline-flex items-center gap-1.5 text-sm text-black font-medium underline">
                          <ExternalLink className="w-3.5 h-3.5" />
                          عرض المحتوى
                        </a>
                      )}
                    </div>
                  )}

                  <button
                    onClick={submitDeliverable}
                    disabled={submitting || (!contentUrl && !uploadedMediaId)}
                    className="btn-primary w-full text-sm disabled:opacity-50"
                  >
                    {submitting ? 'جاري الإرسال...' : 'تأكيد التسليم'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Previous deliverables */}
            {deliverables.map((del: any, i: number) => {
              const isApproved = del.status === 'approved';
              const isRejected = del.status === 'rejected';
              const isPending = del.status === 'submitted';
              const isRevision = del.status === 'revision_requested';

              return (
                <motion.div
                  key={del.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl border border-gray-200 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                          {del.content_type === 'video' ? <Film className="w-4 h-4 text-gray-500" /> :
                           del.content_type === 'image' ? <ImageIcon className="w-4 h-4 text-gray-500" /> :
                           <Link2 className="w-4 h-4 text-gray-500" />}
                        </div>
                        <div>
                          <h3 className="font-medium text-sm text-black">{del.content_type}</h3>
                          <p className="text-xs text-gray-400">
                            {new Date(del.created_at).toLocaleDateString('ar-IQ')}
                          </p>
                        </div>
                        <span className={`mr-auto text-[11px] px-2 py-0.5 rounded-full ${
                          isApproved ? 'bg-green-50 text-green-700' :
                          isRejected ? 'bg-red-50 text-red-600' :
                          isRevision ? 'bg-amber-50 text-amber-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {isApproved ? 'معتمد' : isRejected ? 'مرفوض' : isRevision ? 'طلب تعديل' : 'قيد المراجعة'}
                        </span>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        {del.content_url ? (
                          del.content_url.match(/\.(mp4|mov|avi|webm)(\?|$)/i) || del.content_type === 'video' ? (
                            <video src={del.content_url} controls className="w-full max-h-48 rounded-lg" />
                          ) : del.content_url.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i) || del.content_type === 'image' ? (
                            <img src={del.content_url} alt="" className="w-full max-h-48 object-contain rounded-lg" />
                          ) : (
                            <a href={del.content_url} target="_blank" className="inline-flex items-center gap-1.5 text-sm text-black font-medium underline">
                              <ExternalLink className="w-3.5 h-3.5" />
                              عرض المحتوى
                            </a>
                          )
                        ) : (
                          <p className="text-xs text-gray-400">لا يوجد محتوى</p>
                        )}
                        {del.notes && <p className="text-xs text-gray-500 mt-2">{del.notes}</p>}
                        {del.feedback && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-xs font-medium text-gray-600">ملاحظات المعلن:</p>
                            <p className="text-xs text-gray-500">{del.feedback}</p>
                          </div>
                        )}
                        {del.revision_notes && (
                          <div className="mt-2 pt-2 border-t border-gray-200 bg-amber-50 -m-3 mt-2 p-3 rounded-b-lg">
                            <p className="text-xs font-medium text-amber-700">طلب تعديل:</p>
                            <p className="text-xs text-amber-600">{del.revision_notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {isApproved && (
                      <div className="shrink-0">
                        <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          معتمد
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {deliverables.length === 0 && !canSubmitDeliverable && (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <Clock className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">لا توجد تسليمات بعد</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'messages' && (
          <motion.div
            key="messages"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-bold text-black">المحادثة مع {advertiser.name}</h3>
              </div>
            </div>

            <div className="h-80 overflow-y-auto p-4 space-y-3" dir="rtl">
              {messages.map((msg: any, i: number) => {
                const isMine = msg.sender_id === application.creator_id;
                return (
                  <div key={msg.id || i} className={`flex ${isMine ? 'justify-start' : 'justify-end'}`}>
                    <div
                      className={`max-w-[80%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                        isMine
                          ? 'bg-gray-100 text-gray-800 rounded-br-sm'
                          : 'bg-black text-white rounded-bl-sm'
                      }`}
                    >
                      <p className="text-xs">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isMine ? 'text-gray-400' : 'text-gray-300'}`}>
                        {new Date(msg.created_at).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
              {messages.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-8">لا توجد رسائل بعد</p>
              )}
            </div>

            {canSubmitDeliverable && (
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    className="input-field flex-1 text-sm"
                    placeholder="اكتب رسالتك..."
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="p-2.5 rounded-lg bg-black text-white hover:bg-gray-800 transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
