'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import {
  ArrowRight, Edit, Trash2, Users, DollarSign, Calendar, Clock,
  CheckCircle, XCircle, ExternalLink, MoreVertical, ChevronDown, X, FileText, User, Eye,
  Check, ThumbsUp, AlertCircle, Save,
} from 'lucide-react';
import { CampaignDetailSkeleton } from '@/components/shared/Skeleton';

const statusConfig: Record<string, { label: string; classes: string }> = {
  open: { label: 'مفتوحة', classes: 'bg-gray-100 text-gray-700' },
  active: { label: 'نشطة', classes: 'bg-black text-white' },
  completed: { label: 'مكتملة', classes: 'bg-gray-100 text-gray-500' },
  draft: { label: 'مسودة', classes: 'bg-gray-50 text-gray-400' },
  cancelled: { label: 'ملغية', classes: 'bg-gray-50 text-gray-400' },
};

const appStatusConfig: Record<string, { label: string; classes: string }> = {
  pending: { label: 'بانتظار المراجعة', classes: 'bg-gray-100 text-gray-600' },
  accepted: { label: 'مقبول', classes: 'bg-black text-white' },
  rejected: { label: 'مرفوض', classes: 'bg-gray-100 text-gray-400' },
  completed: { label: 'مكتمل', classes: 'bg-gray-100 text-gray-500' },
};

const statusWorkflow = [
  { key: 'draft', label: 'مسودة' },
  { key: 'open', label: 'مفتوحة' },
  { key: 'active', label: 'نشطة' },
  { key: 'completed', label: 'مكتملة' },
];

export default function CampaignDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('applications');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [deliverableFeedback, setDeliverableFeedback] = useState<Record<string, string>>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '', description: '', brief: '', budget: '',
    category: '', max_creators: 1, start_date: '', end_date: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/advertiser/campaigns/${id}`).then((r) => {
      setCampaign(r.data);
      setEditForm({
        title: r.data.title || '',
        description: r.data.description || '',
        brief: r.data.brief || '',
        budget: r.data.budget?.toString() || '',
        category: r.data.category || '',
        max_creators: r.data.max_creators || 1,
        start_date: r.data.start_date || '',
        end_date: r.data.end_date || '',
      });
    });
  }, [id]);

  const refresh = () => api.get(`/advertiser/campaigns/${id}`).then((r) => setCampaign(r.data));

  const approveApplication = async (appId: number) => {
    try {
      await api.post(`/advertiser/campaigns/${id}/applications/${appId}/approve`);
      toast.success('تم قبول الطلب');
      refresh();
    } catch { toast.error('حدث خطأ'); }
  };

  const rejectApplication = async (appId: number) => {
    try {
      await api.post(`/advertiser/campaigns/${id}/applications/${appId}/reject`);
      toast.success('تم رفض الطلب');
      refresh();
    } catch { toast.error('حدث خطأ'); }
  };

  const approveDeliverable = async (appId: number, delId: number) => {
    try {
      await api.post(`/advertiser/deliverables/${delId}/approve`);
      toast.success('تم اعتماد التسليم');
      refresh();
    } catch { toast.error('حدث خطأ'); }
  };

  const rejectDeliverable = async (appId: number, delId: number) => {
    const feedback = deliverableFeedback[`${appId}-${delId}`];
    if (!feedback?.trim()) {
      toast.error('الرجاء كتابة ملاحظات الرفض');
      return;
    }
    try {
      await api.post(`/advertiser/deliverables/${delId}/reject`, { feedback });
      toast.success('تم رفض التسليم');
      refresh();
    } catch { toast.error('حدث خطأ'); }
  };

  const changeStatus = async (newStatus: string) => {
    setChangingStatus(true);
    try {
      await api.put(`/advertiser/campaigns/${id}`, { status: newStatus });
      toast.success(`تم تغيير الحالة إلى ${statusConfig[newStatus]?.label || newStatus}`);
      setShowStatusMenu(false);
      refresh();
    } catch {
      toast.error('حدث خطأ');
    } finally {
      setChangingStatus(false);
    }
  };

  const deleteCampaign = async () => {
    if (!confirm('هل أنت متأكد من حذف هذه الحملة؟')) return;
    try {
      await api.delete(`/advertiser/campaigns/${id}`);
      toast.success('تم حذف الحملة');
      router.push('/advertiser/campaigns');
    } catch { toast.error('حدث خطأ'); }
  };

  if (!campaign) return (
    <div className="max-w-5xl mx-auto">
      <CampaignDetailSkeleton />
    </div>
  );

  const campStatus = statusConfig[campaign.status] || statusConfig.draft;
  const currentStepIndex = statusWorkflow.findIndex((s) => s.key === campaign.status);

  const activeContributorCount = (campaign.applications || []).filter(
    (a: any) => a.status === 'accepted' || a.status === 'completed'
  ).length;

  return (
    <div className="max-w-4xl space-y-6">
      <Toaster position="top-center" />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between flex-wrap gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-black">{campaign.title}</h1>
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full cursor-pointer transition-all hover:opacity-80 ${campStatus.classes}`}
              >
                {campStatus.label}
              </button>
              <AnimatePresence>
                {showStatusMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-1 z-10 min-w-[120px]"
                  >
                    {statusWorkflow.filter(s => s.key !== campaign.status).map((s) => (
                      <button
                        key={s.key}
                        onClick={() => changeStatus(s.key)}
                        disabled={changingStatus}
                        className="w-full text-right px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {s.label}
                      </button>
                    ))}
                    {campaign.status !== 'cancelled' && (
                      <button
                        onClick={() => changeStatus('cancelled')}
                        disabled={changingStatus}
                        className="w-full text-right px-3 py-2 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        إلغاء الحملة
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            {campaign.category && <>{campaign.category} · </>}
            {new Date(campaign.created_at).toLocaleDateString('ar-IQ')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setEditForm({
              title: campaign.title, description: campaign.description, brief: campaign.brief || '',
              budget: campaign.budget?.toString(), category: campaign.category || '',
              max_creators: campaign.max_creators, start_date: campaign.start_date || '', end_date: campaign.end_date || '',
            }); setShowEditModal(true); }}
            className="inline-flex items-center gap-1.5 bg-white text-gray-600 px-3 py-2 rounded-lg text-xs font-bold border border-gray-200 hover:border-gray-400 hover:text-black transition-all"
          >
            <Edit className="w-3.5 h-3.5" />
            تعديل
          </button>
          <button
            onClick={deleteCampaign}
            className="inline-flex items-center gap-1.5 bg-white text-red-400 px-3 py-2 rounded-lg text-xs font-bold border border-gray-200 hover:border-red-300 hover:text-red-600 transition-all"
          >
            <X className="w-3.5 h-3.5" />
            حذف
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700 leading-relaxed">{campaign.description}</p>
        </div>
        {campaign.brief && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-bold text-black">ملخص الحملة (Brief)</h3>
            </div>
            <p className="text-sm text-gray-600">{campaign.brief}</p>
          </div>
        )}

        <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              الميزانية: <strong className="text-black">${campaign.budget}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <User className="w-4 h-4" />
              المبدعون: <strong className="text-black">{activeContributorCount}/{campaign.max_creators}</strong>
            </span>
            {campaign.start_date && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                من: <strong className="text-black">{new Date(campaign.start_date).toLocaleDateString('ar-IQ')}</strong>
              </span>
            )}
          </div>
          <div className="mr-auto flex items-center gap-1.5 text-xs text-gray-400">
            <Eye className="w-3.5 h-3.5" />
            <span>{(campaign.applications?.length || 0)} متقدم</span>
          </div>
        </div>
      </motion.div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">مسار الحملة</h3>
          <span className="text-[11px] text-gray-400">
            {currentStepIndex + 1} / {statusWorkflow.length}
          </span>
        </div>
        <div className="flex items-center gap-0">
          {statusWorkflow.map((step, i) => {
            const isDone = i < currentStepIndex;
            const isCurrent = i === currentStepIndex;
            const isFuture = i > currentStepIndex;
            return (
              <div key={step.key} className="flex-1 flex flex-col items-center relative">
                <div
                  className={`w-full h-0.5 absolute top-3 -right-1/2 ${
                    isDone || (isCurrent && i > 0) ? 'bg-black' : 'bg-gray-100'
                  }`}
                  style={{ display: i === 0 ? 'none' : 'block' }}
                />
                <div
                  className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                    isDone
                      ? 'bg-black text-white'
                      : isCurrent
                        ? 'bg-black text-white ring-2 ring-gray-200'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isDone ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <p className={`text-[10px] mt-2 ${isCurrent ? 'text-black font-bold' : 'text-gray-400'}`}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-6 border-b border-gray-200">
        {[
          { key: 'applications', label: 'المتقدمون', count: campaign.applications?.length },
          { key: 'deliverables', label: 'التسليمات' },
          { key: 'settings', label: 'الإعدادات' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === tab.key
                ? 'text-black border-black'
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'applications' && (
          <motion.div
            key="applications"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            {campaign.applications?.length > 0 ? (
              campaign.applications.map((app: any, i: number) => {
                const appStatus = appStatusConfig[app.status] || appStatusConfig.pending;
                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-sm font-bold text-white shrink-0">
                            {app.creator?.name?.[0] || '?'}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-black">{app.creator?.name}</h3>
                            <p className="text-xs text-gray-400">
                              {app.creator?.creator_profile?.category || 'مبدع'}
                              {app.creator?.creator_profile?.followers_count && (
                                <> · {app.creator.creator_profile.followers_count.toLocaleString('ar-IQ')} متابع</>
                              )}
                            </p>
                          </div>
                          <span className={`mr-auto text-[11px] font-medium px-2.5 py-0.5 rounded-full ${appStatus.classes}`}>
                            {appStatus.label}
                          </span>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-100">
                          <p className="text-sm text-gray-700 leading-relaxed">{app.proposal}</p>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="inline-flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" />
                            السعر: <strong className="text-black">${app.proposed_rate}</strong>
                          </span>
                        </div>
                      </div>

                      {app.status === 'pending' && (
                        <div className="flex flex-col gap-2 shrink-0">
                          <button
                            onClick={() => approveApplication(app.id)}
                            className="inline-flex items-center gap-1.5 bg-black text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                            قبول
                          </button>
                          <button
                            onClick={() => rejectApplication(app.id)}
                            className="inline-flex items-center gap-1.5 bg-white text-gray-600 px-4 py-2 rounded-lg text-xs font-bold border border-gray-200 hover:border-gray-400 hover:text-black transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                            رفض
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <User className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">لا توجد طلبات بعد</p>
                <p className="text-xs text-gray-300 mt-1">عند تقديم المبدعين، ستظهر طلباتهم هنا</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'deliverables' && (
          <motion.div
            key="deliverables"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            {(() => {
              const allDeliverables = (campaign.applications || [])
                .filter((a: any) => a.deliverables?.length > 0)
                .flatMap((app: any) =>
                  (app.deliverables || []).map((del: any) => ({ ...del, creator: app.creator }))
                );
              return allDeliverables.length > 0 ? (
                allDeliverables.map((del: any, i: number) => {
                  const isApproved = del.status === 'approved';
                  const isRejected = del.status === 'rejected';
                  const isPending = del.status === 'pending';
                  const appId = del.application_id || del.application?.id;
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
                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
                              {del.creator?.name?.[0] || '?'}
                            </div>
                            <div>
                              <h3 className="font-medium text-sm text-black">{del.content_type}</h3>
                              <p className="text-xs text-gray-400">{del.creator?.name}</p>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <a
                              href={del.content_url}
                              target="_blank"
                              className="inline-flex items-center gap-1.5 text-sm text-black font-medium underline underline-offset-2 hover:text-gray-600 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              عرض المحتوى
                            </a>
                            {del.notes && <p className="text-xs text-gray-500 mt-2">{del.notes}</p>}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          {isApproved && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                              <ThumbsUp className="w-3.5 h-3.5" />
                              تم الاعتماد
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                              <X className="w-3.5 h-3.5" />
                              مرفوض
                            </span>
                          )}
                          {isPending && (
                            <div className="space-y-2">
                              <button
                                onClick={() => approveDeliverable(appId, del.id)}
                                className="w-full inline-flex items-center justify-center gap-1.5 bg-black text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition-all"
                              >
                                <Check className="w-3.5 h-3.5" />
                                اعتماد
                              </button>
                              <div className="space-y-1.5">
                                <input
                                  type="text"
                                  placeholder="ملاحظات الرفض..."
                                  value={deliverableFeedback[`${appId}-${del.id}`] || ''}
                                  onChange={(e) => setDeliverableFeedback((prev) => ({
                                    ...prev,
                                    [`${appId}-${del.id}`]: e.target.value,
                                  }))}
                                  className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                                />
                                <button
                                  onClick={() => rejectDeliverable(appId, del.id)}
                                  className="w-full inline-flex items-center justify-center gap-1.5 bg-white text-gray-600 px-4 py-2 rounded-lg text-xs font-bold border border-gray-200 hover:border-gray-400 hover:text-black transition-all"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  رفض
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                  <Clock className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">لا توجد تسليمات بعد</p>
                  <p className="text-xs text-gray-300 mt-1">عند تسليم المبدعين المحتوى، ستظهر هنا</p>
                </div>
              );
            })()}
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <h3 className="text-sm font-bold text-black mb-5">إعدادات الحملة</h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[11px] text-gray-500 font-medium mb-1">عنوان الحملة</p>
                <p className="text-sm text-black font-medium">{campaign.title}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[11px] text-gray-500 font-medium mb-1">التصنيف</p>
                <p className="text-sm text-black font-medium">{campaign.category || '—'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[11px] text-gray-500 font-medium mb-1">الميزانية</p>
                <p className="text-sm text-black font-medium">${campaign.budget}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[11px] text-gray-500 font-medium mb-1">الحد الأقصى للمبدعين</p>
                <p className="text-sm text-black font-medium">{campaign.max_creators}</p>
              </div>
              {campaign.start_date && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[11px] text-gray-500 font-medium mb-1">تاريخ البداية</p>
                  <p className="text-sm text-black font-medium">{new Date(campaign.start_date).toLocaleDateString('ar-IQ')}</p>
                </div>
              )}
              {campaign.end_date && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[11px] text-gray-500 font-medium mb-1">تاريخ النهاية</p>
                  <p className="text-sm text-black font-medium">{new Date(campaign.end_date).toLocaleDateString('ar-IQ')}</p>
                </div>
              )}
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-amber-700">تعديل الحملة</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  اضغط على زر تعديل لتغيير تفاصيل الحملة.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowEditModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-sm font-bold text-black">تعديل الحملة</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">العنوان</label>
                <input type="text" value={editForm.title} onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))} className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">الوصف</label>
                <textarea value={editForm.description} onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))} className="input-field text-sm min-h-[80px]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">الملخص (Brief)</label>
                <textarea value={editForm.brief} onChange={(e) => setEditForm(f => ({ ...f, brief: e.target.value }))} className="input-field text-sm min-h-[60px]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">الميزانية ($)</label>
                  <input type="number" value={editForm.budget} onChange={(e) => setEditForm(f => ({ ...f, budget: e.target.value }))} className="input-field text-sm" min="1" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">الفئة</label>
                  <input type="text" value={editForm.category} onChange={(e) => setEditForm(f => ({ ...f, category: e.target.value }))} className="input-field text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">تاريخ البداية</label>
                  <input type="date" value={editForm.start_date} onChange={(e) => setEditForm(f => ({ ...f, start_date: e.target.value }))} className="input-field text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">تاريخ النهاية</label>
                  <input type="date" value={editForm.end_date} onChange={(e) => setEditForm(f => ({ ...f, end_date: e.target.value }))} className="input-field text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">عدد المبدعين</label>
                <input type="number" value={editForm.max_creators} onChange={(e) => setEditForm(f => ({ ...f, max_creators: parseInt(e.target.value) || 1 }))} className="input-field text-sm" min="1" />
              </div>
            </div>
            <div className="flex items-center justify-between p-5 border-t border-gray-100">
              <button onClick={() => setShowEditModal(false)} className="btn-secondary text-sm">إلغاء</button>
              <button
                onClick={async () => {
                  setSaving(true);
                  try {
                    await api.put(`/advertiser/campaigns/${id}`, {
                      ...editForm,
                      budget: parseFloat(editForm.budget),
                      max_creators: Number(editForm.max_creators),
                    });
                    toast.success('تم التحديث بنجاح');
                    setShowEditModal(false);
                    refresh();
                  } catch (err: any) {
                    const msg = err.response?.data?.message || 'حدث خطأ';
                    toast.error(msg);
                  } finally { setSaving(false); }
                }}
                disabled={saving}
                className="btn-primary text-sm inline-flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" /> {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
