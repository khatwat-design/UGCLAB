'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import {
  User, Mail, Building2, Lock, Bell, Shield, BadgeCheck,
  Save, Eye, EyeOff, Camera,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { TabbedFormSkeleton } from '@/components/shared/Skeleton';
import KycForm from '@/components/KycForm';

type Tab = 'profile' | 'kyc' | 'password' | 'notifications';

export default function AdvertiserSettings() {
  const { user, setUser, isLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [kycRefreshKey, setKycRefreshKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    company_name: '',
    bio: '',
  });

  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const [notifications, setNotifications] = useState({
    email_notifications: true,
    new_application_alert: true,
    message_alert: true,
    campaign_completed_alert: true,
    marketing_emails: false,
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        company_name: (user as any).company_name || '',
        bio: (user as any).bio || '',
      });
      setNotifications((prev) => ({
        ...prev,
        ...((user as any).notification_preferences || {}),
      }));
    }
  }, [user]);

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', profile);
      setUser(res.data.user || res.data);
      toast.success('تم تحديث الملف الشخصي');
    } catch {
      toast.error('حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.new_password_confirmation) {
      toast.error('كلمة المرور الجديدة غير متطابقة');
      return;
    }
    setSaving(true);
    try {
      await api.put('/auth/password', {
        current_password: passwords.current_password,
        password: passwords.new_password,
        password_confirmation: passwords.new_password_confirmation,
      });
      toast.success('تم تغيير كلمة المرور');
      setPasswords({ current_password: '', new_password: '', new_password_confirmation: '' });
    } catch {
      toast.error('حدث خطأ');
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
      setUser({ ...user, avatar: avatarUrl } as any);
      toast.success('تم تحديث الصورة الشخصية');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل رفع الصورة');
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const updateNotifications = async () => {
    setSaving(true);
    try {
      await api.put('/auth/notifications', notifications);
      toast.success('تم تحديث إعدادات الإشعارات');
    } catch {
      toast.error('حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'profile', label: 'الملف الشخصي', icon: User },
    ...(user?.kyc_status !== 'verified' ? [{ key: 'kyc' as Tab, label: 'توثيق الحساب', icon: Shield }] : []),
    { key: 'password', label: 'كلمة المرور', icon: Lock },
    { key: 'notifications', label: 'الإشعارات', icon: Bell },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <Toaster position="top-center" />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="page-title">الإعدادات</h1>
        <p className="page-subtitle">إدارة ملفك الشخصي وإعدادات الحساب</p>
      </motion.div>

      {isLoading ? (
        <TabbedFormSkeleton />
      ) : (<>

      <input ref={avatarInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleAvatarUpload} />

      <div className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200">
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
            <h2 className="font-bold text-black">{user?.name || 'المعلن'}</h2>
            {user?.kyc_status === 'verified' && (
              <BadgeCheck className="w-4 h-4 text-blue-500" />
            )}
          </div>
          <p className="text-sm text-gray-400">{user?.email}</p>
          <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full mt-1 inline-block">
            معلن
          </span>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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

      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
          <motion.form
            key="profile"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            onSubmit={updateProfile}
            className="bg-white rounded-xl border border-gray-200 p-6 space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <User className="w-3.5 h-3.5 inline ml-1" />
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Mail className="w-3.5 h-3.5 inline ml-1" />
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Building2 className="w-3.5 h-3.5 inline ml-1" />
                  اسم الشركة
                </label>
                <input
                  type="text"
                  value={profile.company_name}
                  onChange={(e) => setProfile((p) => ({ ...p, company_name: e.target.value }))}
                  className="input-field"
                  placeholder="اسم شركتك أو علامتك التجارية"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">نبذة عنك</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                className="input-field min-h-[100px]"
                placeholder="اكتب نبذة مختصرة عن نشاطك التجاري..."
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
            </div>
          </motion.form>
        )}

        {activeTab === 'kyc' && (
          <motion.div
            key="kyc"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-white rounded-xl border border-gray-200 p-6 space-y-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5" />
              <h2 className="text-lg font-bold text-black">توثيق الحساب</h2>
            </div>
            <KycForm role={user?.role} onVerified={() => setKycRefreshKey(k => k + 1)} />
          </motion.div>
        )}

        {activeTab === 'password' && (
          <motion.form
            key="password"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            onSubmit={updatePassword}
            className="bg-white rounded-xl border border-gray-200 p-6 space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">كلمة المرور الحالية</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwords.current_password}
                  onChange={(e) => setPasswords((p) => ({ ...p, current_password: e.target.value }))}
                  className="input-field w-full pl-9"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={passwords.new_password}
                  onChange={(e) => setPasswords((p) => ({ ...p, new_password: e.target.value }))}
                  className="input-field"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">تأكيد كلمة المرور</label>
                <input
                  type="password"
                  value={passwords.new_password_confirmation}
                  onChange={(e) => setPasswords((p) => ({ ...p, new_password_confirmation: e.target.value }))}
                  className="input-field"
                  required
                  minLength={8}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'جاري...' : 'تغيير كلمة المرور'}
              </button>
            </div>
          </motion.form>
        )}

        {activeTab === 'notifications' && (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
          >
            <div className="space-y-3">
              {[
                { key: 'email_notifications', label: 'إشعارات البريد الإلكتروني', desc: 'استلام إشعارات على بريدك الإلكتروني' },
                { key: 'new_application_alert', label: 'تنبيهات الطلبات الجديدة', desc: 'عند تقديم مبدع جديد على حملاتك' },
                { key: 'message_alert', label: 'تنبيهات الرسائل', desc: 'عند استلام رسالة جديدة' },
                { key: 'campaign_completed_alert', label: 'اكتمال الحملات', desc: 'عند اكتمال إحدى حملاتك' },
                { key: 'marketing_emails', label: 'عروض وتسويق', desc: 'استلام عروض ونشرات تسويقية' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-black">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(notifications as any)[item.key]}
                      onChange={(e) => setNotifications((p) => ({ ...p, [item.key]: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black" />
                  </label>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={updateNotifications} disabled={saving} className="btn-primary">
                {saving ? 'جاري...' : 'حفظ الإعدادات'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </>)}
    </div>
  );
}
