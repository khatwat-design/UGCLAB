'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { Toaster, toast } from 'react-hot-toast';
import { User, Lock, Bell, Shield, Save, Camera, BadgeCheck, CreditCard } from 'lucide-react';
import { CREATOR_CATEGORIES, IRAQI_GOVERNORATES } from '@/lib/constants';
import { TabbedFormSkeleton } from '@/components/shared/Skeleton';
import { useAuthStore } from '@/stores/authStore';
import KycForm from '@/components/KycForm';

type Tab = 'profile' | 'kyc' | 'payment' | 'password' | 'notifications';

export default function CreatorSettings() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [kycRefreshKey, setKycRefreshKey] = useState(0);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [category, setCategory] = useState('');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [engagementRate, setEngagementRate] = useState(0);

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateField, setStateField] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('zain_cash');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentName, setPaymentName] = useState('');
  const [paymentSaving, setPaymentSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [notifications, setNotifications] = useState({
    new_campaign: true,
    application_update: true,
    message_received: true,
    payment_received: true,
    deliverable_feedback: true,
  });

  useEffect(() => {
    api.get('/auth/me').then((r) => {
      const u = r.data;
      setName(u.name || '');
      setEmail(u.email || '');
      setBio(u.creator_profile?.bio || '');
      setCategory(u.creator_profile?.category || '');
      setPlatforms(u.creator_profile?.platforms || []);
      setFollowersCount(u.creator_profile?.followers_count || 0);
      setEngagementRate(u.creator_profile?.engagement_rate || 0);
      setAddress(u.creator_profile?.address || '');
      setCity(u.creator_profile?.city || '');
      setStateField(u.creator_profile?.state || '');
      setPaymentMethod(u.creator_profile?.payment_method || 'zain_cash');
      setPaymentPhone(u.creator_profile?.payment_phone || '');
      setPaymentName(u.creator_profile?.payment_name || '');
      if (u.notification_preferences) {
        setNotifications({ ...notifications, ...u.notification_preferences });
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/auth/profile', { name, email });
      await api.put('/creator/profile', { category, platforms, followers_count: followersCount, engagement_rate: engagementRate, address, city, state: stateField, country: 'IQ' });
      toast.success('تم حفظ التغييرات');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  const savePaymentMethod = async () => {
    if (!paymentPhone || !paymentName) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    setPaymentSaving(true);
    try {
      await api.put('/creator/payout-methods', {
        payment_method: paymentMethod,
        payment_phone: paymentPhone,
        payment_name: paymentName,
      });
      toast.success('تم حفظ بيانات الدفع بنجاح');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setPaymentSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== newPasswordConfirmation) {
      toast.error('كلمتا المرور غير متطابقتين');
      return;
    }
    setSaving(true);
    try {
      await api.put('/auth/password', { current_password: currentPassword, password: newPassword, password_confirmation: newPasswordConfirmation });
      toast.success('تم تغيير كلمة المرور');
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirmation('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await api.put('/auth/notifications', { notification_preferences: notifications });
      toast.success('تم حفظ الإعدادات');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('collection', 'avatar');
      const res = await api.post('/media/upload', formData);
      const avatarUrl = res.data.url;
      await api.put('/auth/profile', { avatar: avatarUrl });
      if (user) setUser({ ...user, avatar: avatarUrl });
      toast.success('تم تحديث الصورة الشخصية');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل رفع الصورة');
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="page-title">الإعدادات</h1>
          <p className="page-subtitle">إدارة إعدادات حسابك</p>
        </div>
        <TabbedFormSkeleton />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'profile', label: 'الملف الشخصي', icon: User },
    ...(user?.kyc_status !== 'verified' ? [{ key: 'kyc' as Tab, label: 'توثيق الحساب', icon: Shield }] : []),
    { key: 'payment', label: 'بيانات الدفع', icon: CreditCard },
    { key: 'password', label: 'كلمة المرور', icon: Lock },
    { key: 'notifications', label: 'الإشعارات', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />
      <div>
        <h1 className="page-title">الإعدادات</h1>
        <p className="page-subtitle">إدارة حسابك وإعداداتك</p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <input ref={avatarInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleAvatarUpload} />

      <div className="card">
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center text-xl font-bold text-white">
                    {user?.name?.[0] || '?'}
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-black">{user?.name}</h2>
                  {user?.kyc_status === 'verified' && (
                    <BadgeCheck className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <p className="text-sm text-gray-400">{user?.email}</p>
              </div>
            </div>

            <h2 className="text-lg font-bold text-black">الملف الشخصي</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">الاسم</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">التصنيف</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
                  <option value="">اختر التصنيف</option>
                  {CREATOR_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">عدد المتابعين</label>
                <input type="number" value={followersCount} onChange={(e) => setFollowersCount(Number(e.target.value))} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">معدل التفاعل (%)</label>
                <input type="number" step="0.1" value={engagementRate} onChange={(e) => setEngagementRate(Number(e.target.value))} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">المنصات (مفصولة بفاصلة)</label>
                <input type="text" value={platforms.join(', ')} onChange={(e) => setPlatforms(e.target.value.split(',').map((s) => s.trim()))} className="input-field" placeholder="Instagram, YouTube, TikTok" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">نبذة عنك</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="input-field min-h-[100px]" placeholder="اكتب نبذة تعريفية عنك" />
            </div>

            <div className="border-t border-gray-100 pt-4 mt-2">
              <h3 className="text-sm font-bold text-black mb-3">العنوان (لشحن المنتجات)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">العنوان</label>
                  <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="input-field min-h-[60px]" placeholder="العنوان الكامل..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">المحافظة</label>
                  <select value={stateField} onChange={(e) => { setStateField(e.target.value); setCity(''); }} className="input-field">
                    <option value="">اختر المحافظة</option>
                    {Object.keys(IRAQI_GOVERNORATES).map((gov) => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">المدينة</label>
                  <select value={city} onChange={(e) => setCity(e.target.value)} className="input-field" disabled={!stateField}>
                    <option value="">اختر المدينة</option>
                    {stateField && IRAQI_GOVERNORATES[stateField]?.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button onClick={handleSaveProfile} disabled={saving} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50">
              <Save className="w-4 h-4" /> حفظ التغييرات
            </button>
          </div>
        )}

        {activeTab === 'kyc' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5" />
              <h2 className="text-lg font-bold text-black">توثيق الحساب</h2>
            </div>
            <KycForm role={user?.role} onVerified={() => setKycRefreshKey(k => k + 1)} />
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="space-y-4 max-w-md">
            <h2 className="text-lg font-bold text-black">بيانات الدفع</h2>
            <p className="text-xs text-gray-400">أضف طريقة الدفع الخاصة بك لاستلام الأرباح</p>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">طريقة الدفع</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
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
                value={paymentPhone}
                onChange={(e) => setPaymentPhone(e.target.value)}
                className="input-field"
                placeholder="07XX XXX XXXX"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">الاسم</label>
              <input
                type="text"
                value={paymentName}
                onChange={(e) => setPaymentName(e.target.value)}
                className="input-field"
                placeholder="الاسم الكامل"
              />
            </div>
            <button
              onClick={savePaymentMethod}
              disabled={paymentSaving}
              className="btn-primary disabled:opacity-50"
            >
              {paymentSaving ? 'جاري الحفظ...' : 'حفظ بيانات الدفع'}
            </button>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="space-y-4 max-w-md">
            <h2 className="text-lg font-bold text-black">تغيير كلمة المرور</h2>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">كلمة المرور الحالية</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">كلمة المرور الجديدة</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">تأكيد كلمة المرور الجديدة</label>
              <input type="password" value={newPasswordConfirmation} onChange={(e) => setNewPasswordConfirmation(e.target.value)} className="input-field" />
            </div>
            <button onClick={handleChangePassword} disabled={saving || !currentPassword || !newPassword} className="btn-primary disabled:opacity-50">
              تغيير كلمة المرور
            </button>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4 max-w-md">
            <h2 className="text-lg font-bold text-black">إعدادات الإشعارات</h2>
            {Object.entries(notifications).map(([key, value]) => (
              <label key={key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-700">
                  {key === 'new_campaign' && 'حملات جديدة متاحة'}
                  {key === 'application_update' && 'تحديث على طلباتي'}
                  {key === 'message_received' && 'استلام رسالة جديدة'}
                  {key === 'payment_received' && 'استلام دفعة'}
                  {key === 'deliverable_feedback' && 'تقييم المحتوى المسلّم'}
                </span>
                <button
                  onClick={() => setNotifications((prev) => ({ ...prev, [key]: !value }))}
                  className={`w-10 h-5 rounded-full transition-colors relative ${value ? 'bg-black' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${value ? 'right-0.5' : 'right-[18px]'}`} />
                </button>
              </label>
            ))}
            <button onClick={handleSaveNotifications} disabled={saving} className="btn-primary disabled:opacity-50">
              حفظ الإعدادات
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
