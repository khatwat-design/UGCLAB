'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import StatsCard from '@/components/shared/StatsCard';
import { Toaster, toast } from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Wallet, X, Send, CreditCard, Settings } from 'lucide-react';
import { EarningsSkeleton } from '@/components/shared/Skeleton';

export default function CreatorEarnings() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('zain_cash');
  const [submitting, setSubmitting] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [settlementAmount, setSettlementAmount] = useState('');
  const [settlements, setSettlements] = useState<any[]>([]);
  const [settlementSubmitting, setSettlementSubmitting] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState('zain_cash');
  const [payoutPhone, setPayoutPhone] = useState('');
  const [payoutName, setPayoutName] = useState('');
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [payoutSaved, setPayoutSaved] = useState(false);

  const fetchEarnings = (p: number) => {
    setLoading(true);
    api.get(`/creator/earnings?page=${p}`).then((r) => setData(r.data)).finally(() => setLoading(false));
  };

  const fetchSettlements = async () => {
    try {
      const res = await api.get('/creator/settlement-requests');
      setSettlements(res.data.data || []);
    } catch {}
  };

  const fetchPayoutMethods = async () => {
    try {
      const res = await api.get('/creator/payout-methods');
      if (res.data) {
        setPayoutMethod(res.data.payment_method || 'zain_cash');
        setPayoutPhone(res.data.payment_phone || '');
        setPayoutName(res.data.payment_name || '');
        setPayoutSaved(!!res.data.payment_method);
      }
    } catch {}
  };

  useEffect(() => { fetchEarnings(page); }, [page]);

  useEffect(() => {
    if (showPayoutModal) fetchPayoutMethods();
  }, [showPayoutModal]);

  const handleSettlementRequest = async () => {
    const amount = parseFloat(settlementAmount);
    if (!amount || amount <= 0) return;
    if (amount > (data?.pending || 0)) {
      toast.error('المبلغ المعلق غير كافٍ');
      return;
    }
    setSettlementSubmitting(true);
    try {
      await api.post('/creator/settlement-requests', { amount });
      toast.success('تم تقديم طلب التسوية');
      setShowSettlementModal(false);
      setSettlementAmount('');
      fetchSettlements();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setSettlementSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) return;
    if (amount > (data?.balance || 0)) {
      toast.error('الرصيد غير كافٍ');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/payments/withdraw', { amount, payment_method: withdrawMethod });
      toast.success('تم تقديم طلب السحب بنجاح');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      fetchEarnings(page);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayoutSave = async () => {
    if (!payoutPhone || !payoutName) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    setPayoutSubmitting(true);
    try {
      await api.put('/creator/payout-methods', {
        payment_method: payoutMethod,
        payment_phone: payoutPhone,
        payment_name: payoutName,
      });
      toast.success('تم حفظ بيانات الدفع بنجاح');
      setPayoutSaved(true);
      setShowPayoutModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setPayoutSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">الأرباح</h1>
          <p className="page-subtitle">إدارة أرباحك وسحوباتك</p>
        </div>
        <button
          onClick={() => setShowPayoutModal(true)}
          className="inline-flex items-center gap-1.5 bg-white text-gray-600 px-4 py-2 rounded-lg text-xs font-bold border border-gray-200 hover:border-gray-400 hover:text-black transition-all"
        >
          <Settings className="w-4 h-4" />
          {payoutSaved ? 'بيانات الدفع' : 'إعداد الدفع'}
        </button>
      </div>

      {loading ? (
        <EarningsSkeleton />
      ) : (<>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="الرصيد المتاح"
          value={`$${Number(data?.balance || 0).toFixed(2)}`}
          icon={<Wallet className="w-4 h-4 text-gray-600" />}
        />
        <StatsCard
          title="المبلغ المعلق"
          value={`$${Number(data?.pending || 0).toFixed(2)}`}
        />
        <StatsCard
          title="إجمالي الأرباح"
          value={`$${Number((data?.balance || 0) + (data?.pending || 0)).toFixed(2)}`}
        />
      </div>

      <div className="flex gap-3 items-start flex-wrap">
        <button
          onClick={() => setShowWithdrawModal(true)}
          disabled={!data?.balance || data.balance <= 0}
          className="btn-primary disabled:opacity-50 inline-flex items-center gap-1.5"
        >
          <Wallet className="w-4 h-4" /> سحب الأرباح
        </button>
        <button
          onClick={() => { setSettlementAmount(''); setShowSettlementModal(true); fetchSettlements(); }}
          disabled={!data?.pending || data.pending <= 0}
          className="inline-flex items-center gap-1.5 bg-white text-gray-600 px-4 py-2 rounded-lg text-xs font-bold border border-gray-200 hover:border-gray-400 hover:text-black transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" /> طلب تسوية
        </button>
      </div>

      {!payoutSaved && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-800">بيانات الدفع غير مكتملة</p>
              <p className="text-xs text-amber-700 mt-1">يرجى إضافة طريقة الدفع الخاصة بك لتتمكن من استلام الأرباح</p>
              <button
                onClick={() => setShowPayoutModal(true)}
                className="mt-2 text-xs font-bold text-amber-900 underline hover:no-underline"
              >
                إضافة بيانات الدفع
              </button>
            </div>
          </div>
        </div>
      )}

      {settlements.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-bold text-black mb-4">طلبات التسوية</h2>
          <div className="space-y-2">
            {settlements.map((sr: any) => (
              <div key={sr.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div>
                  <p className="text-sm text-black font-medium">${Number(sr.amount).toFixed(2)}</p>
                  <p className="text-xs text-gray-400">{new Date(sr.created_at).toLocaleDateString('ar-IQ')}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  sr.status === 'approved' ? 'bg-green-50 text-green-700' :
                  sr.status === 'rejected' ? 'bg-red-50 text-red-600' :
                  'bg-amber-50 text-amber-700'
                }`}>
                  {sr.status === 'approved' ? 'تمت الموافقة' : sr.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-bold text-black mb-4">سجل المعاملات</h2>
        {!data?.transactions?.data || data.transactions.data.length === 0 ? (
          <p className="text-center text-gray-400 py-4">لا توجد معاملات بعد</p>
        ) : (
          <>
            <div className="space-y-3">
              {data.transactions.data.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm text-black">{tx.description || 'معاملة'}</p>
                    <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString('ar-IQ')}</p>
                  </div>
                  <span className={`font-medium text-sm ${Number(tx.amount) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Number(tx.amount) >= 0 ? '+' : ''}${Math.abs(Number(tx.amount)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            {data.transactions.meta?.last_page > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4 mt-4 border-t border-gray-100">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary text-sm disabled:opacity-30 inline-flex items-center gap-1"
                >
                  <ChevronRight className="w-4 h-4" /> السابق
                </button>
                <span className="text-xs text-gray-400">
                  صفحة {data.transactions.meta.current_page} من {data.transactions.meta.last_page}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(data.transactions.meta.last_page, p + 1))}
                  disabled={page === data.transactions.meta.last_page}
                  className="btn-secondary text-sm disabled:opacity-30 inline-flex items-center gap-1"
                >
                  التالي <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
      </>)}

      {/* Settlement Modal */}
      {showSettlementModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">طلب تسوية</h3>
              <button onClick={() => setShowSettlementModal(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              المبلغ المعلق: <span className="font-bold text-black">${Number(data?.pending || 0).toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-400">
              سيتم تسليم المبلغ المعلق إلى محفظتك بعد موافقة المشرف.
            </p>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">المبلغ</label>
              <input
                type="number"
                value={settlementAmount}
                onChange={(e) => setSettlementAmount(e.target.value)}
                className="input-field"
                placeholder="أدخل المبلغ"
                min={0}
                max={data?.pending || 0}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSettlementRequest}
                disabled={settlementSubmitting || !settlementAmount || parseFloat(settlementAmount) <= 0}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {settlementSubmitting ? 'جاري الإرسال...' : 'تقديم الطلب'}
              </button>
              <button onClick={() => setShowSettlementModal(false)} className="btn-secondary flex-1">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">سحب الأرباح</h3>
              <button onClick={() => setShowWithdrawModal(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              الرصيد المتاح: <span className="font-bold text-black">${Number(data?.balance || 0).toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-400">سيتم التحويل خلال 48 ساعة</p>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">المبلغ</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="input-field"
                placeholder="أدخل المبلغ"
                min={0}
                max={data?.balance || 0}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">طريقة السحب</label>
              <select
                value={withdrawMethod}
                onChange={(e) => setWithdrawMethod(e.target.value)}
                className="input-field"
              >
                <option value="zain_cash">Zain Cash</option>
                <option value="fib">FIB</option>
                <option value="qi_card">Qi Card</option>
                <option value="bank_transfer">تحويل بنكي</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleWithdraw}
                disabled={submitting || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {submitting ? 'جاري السحب...' : 'تأكيد السحب'}
              </button>
              <button onClick={() => setShowWithdrawModal(false)} className="btn-secondary flex-1">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payout Methods Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">بيانات الدفع</h3>
              <button onClick={() => setShowPayoutModal(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400">أضف بيانات الدفع الخاصة بك لاستلام الأرباح</p>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">طريقة الدفع</label>
              <select
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value)}
                className="input-field"
              >
                <option value="zain_cash">Zain Cash</option>
                <option value="super_kay">Super Kay</option>
                <option value="fib">FIB</option>
                <option value="bank_transfer">تحويل بنكي</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">رقم الهاتف</label>
              <input
                type="text"
                value={payoutPhone}
                onChange={(e) => setPayoutPhone(e.target.value)}
                className="input-field"
                placeholder="07XX XXX XXXX"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">الاسم</label>
              <input
                type="text"
                value={payoutName}
                onChange={(e) => setPayoutName(e.target.value)}
                className="input-field"
                placeholder="الاسم الكامل"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePayoutSave}
                disabled={payoutSubmitting}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {payoutSubmitting ? 'جاري الحفظ...' : 'حفظ البيانات'}
              </button>
              <button onClick={() => setShowPayoutModal(false)} className="btn-secondary flex-1">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
