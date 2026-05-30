'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { Toaster, toast } from 'react-hot-toast';
import {
  Gift, Star, Flame, Zap, Award, Clock, History, ShoppingBag,
  ChevronLeft, ChevronRight, RotateCcw, Lock, Check, Package,
  BadgeCheck, TrendingUp, DollarSign, X
} from 'lucide-react';
import { Skeleton } from '@/components/shared/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  rising: { label: 'صاعد', color: 'text-gray-600', bg: 'bg-gray-100', icon: '🌱' },
  creator: { label: 'مبدع', color: 'text-blue-600', bg: 'bg-blue-100', icon: '⭐' },
  pro: { label: 'محترف', color: 'text-amber-600', bg: 'bg-amber-100', icon: '🔥' },
  elite: { label: 'نخبة', color: 'text-purple-600', bg: 'bg-purple-100', icon: '👑' },
};

export default function LoyaltyPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'store' | 'redemptions'>('overview');
  const [loyalty, setLoyalty] = useState<any>(null);
  const [rewards, setRewards] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [txPage, setTxPage] = useState(1);
  const [txMeta, setTxMeta] = useState<any>(null);
  const [redeemModal, setRedeemModal] = useState<any>(null);
  const [address, setAddress] = useState({ street: '', city: '', state: '', phone: '', full_name: '' });
  const [redeeming, setRedeeming] = useState(false);

  const fetchLoyalty = useCallback(async () => {
    try {
      const [loyRes, rewRes] = await Promise.all([
        api.get('/loyalty/me'),
        api.get('/loyalty/rewards'),
      ]);
      setLoyalty(loyRes.data);
      setRewards(rewRes.data.data || []);
    } catch {
      toast.error('فشل تحميل بيانات المكافآت');
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await api.get(`/loyalty/transactions?page=${txPage}&per_page=20`);
      setTransactions(res.data.data || []);
      setTxMeta(res.data.meta);
    } catch {}
  }, [txPage]);

  const fetchRedemptions = useCallback(async () => {
    try {
      const res = await api.get('/loyalty/redemptions');
      setRedemptions(res.data.data || []);
    } catch {}
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchLoyalty(), fetchTransactions(), fetchRedemptions()])
      .finally(() => setLoading(false));
  }, [fetchLoyalty, fetchTransactions, fetchRedemptions]);

  const handleDailyLogin = async () => {
    setLoginLoading(true);
    try {
      const res = await api.post('/loyalty/daily-login');
      if (res.data.already_logged) {
        toast('سجلت حضورك مسبقاً اليوم');
      } else {
        toast.success(`+${res.data.points_earned} نقطة! 🔥`);
        if (res.data.milestone_bonus > 0) {
          toast.success(`🎉 إنجاز ${res.data.streak} يوم متتالي! مكافأة ${res.data.milestone_bonus} نقطة!`);
        }
      }
      fetchLoyalty();
    } catch {
      toast.error('حدث خطأ');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!address.street || !address.city || !address.state || !address.phone || !address.full_name) {
      toast.error('يرجى تعبئة جميع الحقول');
      return;
    }
    setRedeeming(true);
    try {
      await api.post('/loyalty/redeem', {
        reward_id: redeemModal.id,
        address,
      });
      toast.success('تم استبدال المكافأة بنجاح!');
      setRedeemModal(null);
      setAddress({ street: '', city: '', state: '', phone: '', full_name: '' });
      fetchLoyalty();
      fetchRedemptions();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ';
      if (err.response?.data?.code === 'REWARD_BUDGET_EXHAUSTED') {
        toast(msg, { icon: '😔', duration: 5000 });
      } else {
        toast.error(msg);
      }
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) return <LoyaltySkeleton />;

  const tier = TIER_CONFIG[loyalty?.tier] || TIER_CONFIG.rising;
  const nextTierName = loyalty?.next_tier ? TIER_CONFIG[loyalty.next_tier]?.label : null;

  const tabs = [
    { id: 'overview' as const, label: 'نظرة عامة', icon: <Gift className="w-4 h-4" /> },
    { id: 'history' as const, label: 'سجل النقاط', icon: <History className="w-4 h-4" /> },
    { id: 'store' as const, label: 'المتجر', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'redemptions' as const, label: 'استرداداتي', icon: <Package className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">المكافآت والولاء</h1>
          <p className="page-subtitle">اكسب النقاط وارتقِ بمرتبتك لتحصل على مكافآت حصرية</p>
        </div>
      </div>

      {/* Loyalty Header */}
      <div className="card p-6 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl ${tier.bg} flex items-center justify-center text-3xl`}>
              {tier.icon}
            </div>
            <div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${tier.color} ${tier.bg} mb-2`}>
                <BadgeCheck className="w-4 h-4" />
                {tier.label}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-black">{loyalty?.available_points ?? 0}</span>
                <span className="text-sm text-gray-400">نقطة متاحة</span>
              </div>
              {nextTierName && (
                <p className="text-xs text-gray-400 mt-1">
                  <TrendingUp className="w-3 h-3 inline ml-1" />
                  {loyalty?.next_tier_points_needed} نقطة للوصول إلى {nextTierName}
                </p>
              )}
            </div>
          </div>

          {/* Streak Widget inline */}
          <div className="text-center">
            <div className="flex items-center gap-1 text-2xl font-bold">
              <Flame className={`w-6 h-6 ${(loyalty?.current_streak ?? 0) > 0 ? 'text-orange-500' : 'text-gray-300'}`} />
              <span className={loyalty?.current_streak > 0 ? 'text-black' : 'text-gray-400'}>
                {loyalty?.current_streak ?? 0}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-2">يوم متتالي</p>
            <button
              onClick={handleDailyLogin}
              disabled={loginLoading}
              className="btn-primary text-xs !py-1.5 !px-4 disabled:opacity-50"
            >
              {loginLoading ? '...' : 'سجّل حضورك اليوم'}
            </button>
          </div>
        </div>

        {/* Streak week */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
          {loyalty?.streak_week?.map((day: any, i: number) => (
            <div key={i} className="flex-1 text-center">
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold
                ${day.status === 'done' ? 'bg-green-100 text-green-600' : 
                  day.status === 'today' ? 'ring-2 ring-black bg-gray-50 text-gray-700' : 
                  'bg-gray-50 text-gray-300'}`}>
                {day.status === 'done' ? <Check className="w-3.5 h-3.5" /> : 
                 day.status === 'today' ? <Zap className="w-3.5 h-3.5" /> : '-'}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">{day.day_name?.slice(0, 2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 pb-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap
              ${activeTab === tab.id ? 'text-black bg-white border-b-2 border-black' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="stat-card">
                <div className="flex items-start justify-between mb-2">
                  <span className="stat-label">إجمالي النقاط</span>
                  <Award className="w-5 h-5 text-amber-500" />
                </div>
                <span className="stat-value">{loyalty?.total_points ?? 0}</span>
              </div>
              <div className="stat-card">
                <div className="flex items-start justify-between mb-2">
                  <span className="stat-label">النقاط المتاحة</span>
                  <Gift className="w-5 h-5 text-green-500" />
                </div>
                <span className="stat-value">{loyalty?.available_points ?? 0}</span>
              </div>
              <div className="stat-card">
                <div className="flex items-start justify-between mb-2">
                  <span className="stat-label">أطول سلسلة</span>
                  <Flame className="w-5 h-5 text-orange-500" />
                </div>
                <span className="stat-value">{loyalty?.longest_streak ?? 0}</span>
              </div>
              <div className="stat-card">
                <div className="flex items-start justify-between mb-2">
                  <span className="stat-label">النقاط (90 يوم)</span>
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <span className="stat-value">{loyalty?.points_90d ?? 0}</span>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Summary */}
            <div className="flex items-center gap-4 mb-4 text-sm">
              <span className="text-gray-500">
                إجمالي مكتسب: <strong className="text-green-600">{txMeta?.total ? '—' : '—'}</strong>
              </span>
              <span className="text-gray-500">
                ينتهي هذا الشهر: <strong className="text-amber-600">{txMeta?.expiring_this_month ?? 0}</strong>
              </span>
            </div>

            <div className="space-y-2">
              {transactions.length > 0 ? transactions.map((tx: any) => (
                <div key={tx.id} className="card flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm
                      ${tx.type === 'earn' ? 'bg-green-50 text-green-600' : 
                        tx.type === 'spend' ? 'bg-red-50 text-red-500' : 
                        tx.type === 'expire' ? 'bg-gray-50 text-gray-400' : 'bg-blue-50 text-blue-500'}`}>
                      {tx.type === 'earn' ? '+' : tx.type === 'spend' ? '−' : '×'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-black">
                        {tx.source === 'daily_login' ? 'تسجيل حضور يومي' :
                         tx.source === 'streak_milestone' ? 'إنجاز سلسلة' :
                         tx.source === 'campaign_complete' ? 'إتمام حملة' :
                         tx.source === 'redemption' ? 'استبدال مكافأة' :
                         tx.source === 'expiry' ? 'انتهاء صلاحية' :
                         tx.source === 'referral' ? 'دعوة صديق' :
                         tx.source}
                      </p>
                      <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString('ar-IQ')}</p>
                    </div>
                  </div>
                  <span className={`font-bold text-sm ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </span>
                </div>
              )) : (
                <div className="text-center py-12 text-gray-400 text-sm">
                  لا توجد معاملات بعد
                </div>
              )}
            </div>

            {txMeta && txMeta.last_page > 1 && (
              <div className="flex items-center justify-between pt-4">
                <span className="text-xs text-gray-400">صفحة {txMeta.current_page} من {txMeta.last_page}</span>
                <div className="flex gap-2">
                  <button onClick={() => setTxPage(p => Math.max(1, p - 1))} disabled={txPage <= 1}
                    className="btn-secondary !py-1 !px-2 disabled:opacity-30">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => setTxPage(p => p + 1)} disabled={txPage >= txMeta.last_page}
                    className="btn-secondary !py-1 !px-2 disabled:opacity-30">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'store' && (
          <motion.div key="store" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map((reward: any) => {
                const canAfford = reward.is_affordable;
                const meetsTier = true; // already filtered by API
                const inStock = reward.stock === null || reward.stock > 0;
                const budgetOk = reward.budget_available;
                const available = canAfford && inStock && budgetOk;

                return (
                  <div key={reward.id} className={`card p-4 relative ${!available ? 'opacity-60' : ''}`}>
                    {!available && (
                      <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                        <div className="text-center">
                          <Lock className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                          <p className="text-xs text-gray-400">
                            {!canAfford ? 'نقاط غير كافية' : 
                             !inStock ? 'نفد من المخزون' :
                             !budgetOk ? 'الميزانية الشهرية نفدت' : ''}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-black">{reward.name}</h3>
                        <span className="text-xs text-gray-400">{reward.category}</span>
                      </div>
                      {reward.min_tier !== 'rising' && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                          ${reward.min_tier === 'creator' ? 'bg-blue-50 text-blue-600' :
                            reward.min_tier === 'pro' ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-600'}`}>
                          {TIER_CONFIG[reward.min_tier]?.label}
                        </span>
                      )}
                    </div>
                    {reward.description && (
                      <p className="text-xs text-gray-400 mb-3 line-clamp-2">{reward.description}</p>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-lg font-bold text-amber-600">{reward.points_cost} نقطة</span>
                      <button
                        onClick={() => {
                          setRedeemModal(reward);
                          setAddress({ street: '', city: '', state: '', phone: '', full_name: '' });
                        }}
                        disabled={!available}
                        className="btn-primary text-xs !py-1.5 !px-3 disabled:opacity-40"
                      >
                        استبدال
                      </button>
                    </div>
                    {reward.delivery_days && (
                      <p className="text-[10px] text-gray-300 mt-2">التوصيل خلال {reward.delivery_days} أيام</p>
                    )}
                  </div>
                );
              })}
              {rewards.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-400 text-sm">
                  لا توجد مكافآت متاحة حالياً
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'redemptions' && (
          <motion.div key="redemptions" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="space-y-2">
              {redemptions.length > 0 ? redemptions.map((r: any) => (
                <div key={r.id} className="card flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <Package className="w-8 h-8 text-gray-300" />
                    <div>
                      <p className="text-sm font-medium text-black">{r.reward?.name || 'مكافأة'}</p>
                      <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('ar-IQ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">-{r.points_used} نقطة</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${r.status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                        r.status === 'processing' ? 'bg-blue-50 text-blue-600' :
                        r.status === 'shipped' ? 'bg-amber-50 text-amber-600' :
                        r.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                      {r.status === 'pending' ? 'قيد المراجعة' :
                       r.status === 'processing' ? 'قيد التجهيز' :
                       r.status === 'shipped' ? 'تم الشحن' :
                       r.status === 'delivered' ? 'تم التوصيل' : 'ملغي'}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-gray-400 text-sm">
                  لم تستبدل أي مكافأة بعد
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Redeem Modal */}
      {redeemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">استبدال المكافأة</h3>
              <button onClick={() => setRedeemModal(null)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500">{redeemModal.name}</p>
            <p className="text-2xl font-bold text-amber-600">{redeemModal.points_cost} نقطة</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">الاسم الكامل</label>
                <input value={address.full_name} onChange={(e) => setAddress(a => ({ ...a, full_name: e.target.value }))}
                  className="input-field text-sm" placeholder="الاسم الكامل" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">المدينة</label>
                  <input value={address.city} onChange={(e) => setAddress(a => ({ ...a, city: e.target.value }))}
                    className="input-field text-sm" placeholder="المدينة" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">المحافظة</label>
                  <input value={address.state} onChange={(e) => setAddress(a => ({ ...a, state: e.target.value }))}
                    className="input-field text-sm" placeholder="المحافظة" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">العنوان</label>
                <input value={address.street} onChange={(e) => setAddress(a => ({ ...a, street: e.target.value }))}
                  className="input-field text-sm" placeholder="العنوان التفصيلي" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">رقم الهاتف</label>
                <input value={address.phone} onChange={(e) => setAddress(a => ({ ...a, phone: e.target.value }))}
                  className="input-field text-sm" placeholder="رقم الهاتف" dir="ltr" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleRedeem} disabled={redeeming}
                className="btn-primary flex-1 disabled:opacity-50">
                {redeeming ? 'جاري...' : 'تأكيد الاستبدال'}
              </button>
              <button onClick={() => setRedeemModal(null)} className="btn-secondary flex-1">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LoyaltySkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><Skeleton className="h-7 w-40 mb-2" /><Skeleton className="h-4 w-60" /></div>
      </div>
      <div className="card p-6">
        <div className="flex items-center gap-4"><Skeleton className="w-16 h-16 rounded-2xl" /><div><Skeleton className="h-5 w-20 mb-2" /><Skeleton className="h-8 w-32" /></div></div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    </div>
  );
}
