'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import {
  Wallet, Plus, CreditCard, ArrowLeft, Check, History,
  TrendingDown, TrendingUp, Banknote, ChevronDown, DollarSign,
} from 'lucide-react';
import { BillingSkeleton } from '@/components/shared/Skeleton';

const txTypeConfig: Record<string, { icon: any; label: string }> = {
  deposit: { icon: TrendingUp, label: 'إيداع' },
  withdrawal: { icon: TrendingDown, label: 'سحب' },
  payment: { icon: DollarSign, label: 'دفع' },
  refund: { icon: Banknote, label: 'استرجاع' },
};

export default function AdvertiserBilling() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showReceiptDeposit, setShowReceiptDeposit] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [expandedTx, setExpandedTx] = useState<number | null>(null);
  const [depositRequests, setDepositRequests] = useState<any[]>([]);
  const [receiptAmount, setReceiptAmount] = useState('');
  const [receiptMethod, setReceiptMethod] = useState('zain_cash');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptSubmitting, setReceiptSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/payments/transactions').then((r) => setTransactions(r.data.data || [])),
      api.get('/wallet').then((r) => setWallet(r.data)).catch(() => {}),
      api.get('/payments/deposit-requests').then((r) => setDepositRequests(r.data.data || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const refresh = () => {
    api.get('/payments/transactions').then((r) => setTransactions(r.data.data || []));
    api.get('/wallet').then((r) => setWallet(r.data)).catch(() => {});
    api.get('/payments/deposit-requests').then((r) => setDepositRequests(r.data.data || [])).catch(() => {});
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/payments/deposit', { amount: parseFloat(depositAmount), payment_method: 'wallet' });
      toast.success('تم إيداع المبلغ بنجاح');
      setShowDeposit(false);
      setDepositAmount('');
      refresh();
    } catch {
      toast.error('حدث خطأ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح');
      return;
    }
    if (parseFloat(withdrawAmount) > (wallet?.balance || 0)) {
      toast.error('الرصيد غير كافٍ');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/payments/withdraw', { amount: parseFloat(withdrawAmount) });
      toast.success('تم طلب السحب بنجاح');
      setShowWithdraw(false);
      setWithdrawAmount('');
      refresh();
    } catch {
      toast.error('حدث خطأ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReceiptDeposit = async () => {
    if (!receiptAmount || parseFloat(receiptAmount) <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح');
      return;
    }
    if (!receiptFile) {
      toast.error('الرجاء تحميل صورة الإيصال');
      return;
    }
    setReceiptSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('amount', receiptAmount);
      formData.append('payment_method', receiptMethod);
      formData.append('receipt_image', receiptFile);
      await api.post('/payments/deposit-requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('تم تقديم طلب الإيداع، في انتظار مراجعة المشرف');
      setShowReceiptDeposit(false);
      setReceiptAmount('');
      setReceiptFile(null);
      setReceiptPreview(null);
      refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setReceiptSubmitting(false);
    }
  };

  const paymentMethods = [
    { name: 'Zain Cash', desc: 'محفظة زين كاش', icon: '💳' },
    { name: 'FIB', desc: 'FIB الإماراتي', icon: '🏦' },
    { name: 'Qi Card', desc: 'كي كارد العراقي', icon: '💳' },
  ];

  const quickAmounts = [50, 100, 250, 500, 1000];
  const totalSpent = transactions
    .filter((tx: any) => tx.type === 'payment')
    .reduce((sum: number, tx: any) => sum + Math.abs(tx.amount), 0);

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      {loading ? (
        <BillingSkeleton />
      ) : (<>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="page-title">الفواتير والدفع</h1>
          <p className="page-subtitle">إدارة رصيدك وطرق الدفع وسجل المعاملات</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWithdraw(true)}
            className="inline-flex items-center gap-1.5 bg-white text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 hover:border-gray-400 hover:text-black transition-all"
          >
            <TrendingDown className="w-4 h-4" />
            سحب
          </button>
          <button
            onClick={() => setShowDeposit(true)}
            className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all hover:shadow-lg hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            إيداع
          </button>
          <button
            onClick={() => setShowReceiptDeposit(true)}
            className="inline-flex items-center gap-1.5 bg-white text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 hover:border-gray-400 hover:text-black transition-all"
          >
            <CreditCard className="w-4 h-4" />
            إيداع بإيصال
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <div className="bg-black text-white rounded-xl p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">الرصيد الحالي</span>
          </div>
          <p className="text-2xl font-bold">${Number(wallet?.balance || 0).toFixed(2)}</p>
          {Number(wallet?.balance || 0) > 0 && (
            <p className="text-[10px] text-gray-500 mt-1">متاح للسحب والدفع</p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
          <span className="text-xs text-gray-400">الرصيد المعلق</span>
          <p className="text-xl font-bold text-black mt-1">${Number(wallet?.pending_balance || 0).toFixed(2)}</p>
          <p className="text-[10px] text-gray-400 mt-1">معلق حتى اكتمال الحملات</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
          <span className="text-xs text-gray-400">إجمالي المصروف</span>
          <p className="text-xl font-bold text-black mt-1">${totalSpent.toFixed(2)}</p>
          <p className="text-[10px] text-gray-400 mt-1">عبر جميع الحملات</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-gray-200 p-6"
      >
        <h2 className="text-sm font-bold text-black mb-4">طرق الدفع المتاحة</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {paymentMethods.map((method) => (
            <div
              key={method.name}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-gray-400 cursor-pointer transition-all hover:shadow-sm group"
            >
              <span className="text-xl">{method.icon}</span>
              <div>
                <p className="text-sm font-medium text-black">{method.name}</p>
                <p className="text-xs text-gray-400">{method.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {depositRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-bold text-black">طلبات الإيداع</h2>
          </div>
          <div className="space-y-2">
            {depositRequests.map((dr: any) => (
              <div key={dr.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100">
                <div>
                  <p className="text-sm text-black font-medium">${Number(dr.amount).toFixed(2)}</p>
                  <p className="text-xs text-gray-400">{new Date(dr.created_at).toLocaleDateString('ar-IQ')}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  dr.status === 'approved' ? 'bg-green-50 text-green-700' :
                  dr.status === 'rejected' ? 'bg-red-50 text-red-600' :
                  'bg-amber-50 text-amber-700'
                }`}>
                  {dr.status === 'approved' ? 'تمت الموافقة' : dr.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-xl border border-gray-200 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-gray-500" />
          <h2 className="text-sm font-bold text-black">سجل المعاملات</h2>
          {transactions.length > 0 && (
            <span className="text-[11px] text-gray-400 mr-auto">{transactions.length} معاملة</span>
          )}
        </div>
        {transactions.length === 0 ? (
          <div className="text-center py-10">
            <CreditCard className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">لا توجد معاملات بعد</p>
            <p className="text-xs text-gray-300 mt-1">قم بإيداع رصيد لبدء المعاملات</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx: any) => {
              const config = txTypeConfig[tx.type] || { icon: CreditCard, label: tx.type };
              const Icon = config.icon;
              const isExpanded = expandedTx === tx.id;
              return (
                <motion.div
                  key={tx.id}
                  layout
                  className="p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                  onClick={() => setExpandedTx(isExpanded ? null : tx.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        tx.type === 'deposit' ? 'bg-green-50' :
                        tx.type === 'withdrawal' ? 'bg-red-50' :
                        tx.type === 'payment' ? 'bg-gray-100' : 'bg-gray-50'
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          tx.type === 'deposit' ? 'text-green-600' :
                          tx.type === 'withdrawal' ? 'text-red-500' :
                          'text-gray-500'
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm text-black font-medium">{tx.description || config.label}</p>
                        <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString('ar-IQ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${
                        tx.type === 'deposit' || tx.type === 'refund' ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {tx.type === 'deposit' || tx.type === 'refund' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                          {tx.reference && <span>المرجع: {tx.reference}</span>}
                          {tx.status && (
                            <span className={
                              tx.status === 'completed' ? 'text-green-600' :
                              tx.status === 'pending' ? 'text-amber-600' : 'text-gray-500'
                            }>
                              الحالة: {tx.status === 'completed' ? 'مكتمل' : tx.status === 'pending' ? 'معلق' : tx.status}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showDeposit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeposit(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-5 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-black">إيداع رصيد</h3>
                  <p className="text-xs text-gray-400">اختر المبلغ وطريقة الدفع</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">المبلغ ($)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-lg font-bold text-center focus:border-black outline-none transition-colors"
                  placeholder="0.00"
                  min="1"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-5 gap-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setDepositAmount(String(amount))}
                    className="py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:border-black hover:text-black transition-all"
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDeposit}
                  disabled={isSubmitting}
                  className="flex-1 bg-black text-white py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all disabled:opacity-50 hover:shadow-lg"
                >
                  {isSubmitting ? 'جاري...' : 'تأكيد الإيداع'}
                </button>
                <button
                  onClick={() => setShowDeposit(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showReceiptDeposit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowReceiptDeposit(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-5 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-black">إيداع بإيصال</h3>
                  <p className="text-xs text-gray-400">قم بتحميل صورة الإيصال للمراجعة</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">المبلغ ($)</label>
                <input
                  type="number"
                  value={receiptAmount}
                  onChange={(e) => setReceiptAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-lg font-bold text-center focus:border-black outline-none transition-colors"
                  placeholder="0.00"
                  min="1"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">طريقة الدفع</label>
                <select
                  value={receiptMethod}
                  onChange={(e) => setReceiptMethod(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-black outline-none transition-colors"
                >
                  <option value="zain_cash">Zain Cash</option>
                  <option value="super_kay">Super Kay</option>
                  <option value="fib">FIB</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">صورة الإيصال</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-400 transition-colors">
                  {receiptPreview ? (
                    <img src={receiptPreview} alt="Receipt" className="h-full object-contain p-2" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <CreditCard className="w-6 h-6 text-gray-300" />
                      <span className="text-xs text-gray-400">اضغط لرفع الإيصال</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setReceiptFile(file);
                        setReceiptPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReceiptDeposit}
                  disabled={receiptSubmitting || !receiptFile || !receiptAmount}
                  className="flex-1 bg-black text-white py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all disabled:opacity-50 hover:shadow-lg"
                >
                  {receiptSubmitting ? 'جاري...' : 'تقديم الطلب'}
                </button>
                <button
                  onClick={() => { setShowReceiptDeposit(false); setReceiptFile(null); setReceiptPreview(null); }}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showWithdraw && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowWithdraw(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-5 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-black">سحب رصيد</h3>
                  <p className="text-xs text-gray-400">الرصيد المتاح: ${Number(wallet?.balance || 0).toFixed(2)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">المبلغ ($)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-lg font-bold text-center focus:border-black outline-none transition-colors"
                  placeholder="0.00"
                  min="1"
                  max={wallet?.balance || 0}
                  autoFocus
                />
              </div>

              {parseFloat(withdrawAmount) > (wallet?.balance || 0) && withdrawAmount && (
                <p className="text-xs text-red-500">الرصيد غير كافٍ</p>
              )}

              <div className="grid grid-cols-3 gap-2">
                {[50, 100, 200].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setWithdrawAmount(String(amount))}
                    className="py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:border-black hover:text-black transition-all"
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleWithdraw}
                  disabled={isSubmitting || parseFloat(withdrawAmount) > (wallet?.balance || 0)}
                  className="flex-1 bg-black text-white py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all disabled:opacity-50 hover:shadow-lg"
                >
                  {isSubmitting ? 'جاري...' : 'تأكيد السحب'}
                </button>
                <button
                  onClick={() => setShowWithdraw(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </>)}
    </div>
  );
}
