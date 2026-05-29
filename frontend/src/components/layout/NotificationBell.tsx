'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Megaphone, MessageSquare, UserCheck, CheckCheck,
  DollarSign, FileText, X, Inbox,
} from 'lucide-react';

const typeConfig: Record<string, { label: string; icon: any; color: string }> = {
  invitation: { label: 'دعوة', icon: UserCheck, color: 'text-blue-600 bg-blue-50' },
  application: { label: 'طلب تقديم', icon: FileText, color: 'text-purple-600 bg-purple-50' },
  message: { label: 'رسالة جديدة', icon: MessageSquare, color: 'text-green-600 bg-green-50' },
  campaign_completed: { label: 'اكتمال حملة', icon: Megaphone, color: 'text-gray-600 bg-gray-100' },
  payment: { label: 'دفعة', icon: DollarSign, color: 'text-amber-600 bg-amber-50' },
};

function getLink(type: string, data: any, role: string): string {
  switch (type) {
    case 'invitation':
      return role === 'creator' ? '/creator/campaigns' : '/advertiser/campaigns';
    case 'application':
      return role === 'advertiser' && data?.campaign_id
        ? `/advertiser/campaigns/${data.campaign_id}`
        : '/creator/applications';
    case 'message':
      return `/${role}/messages`;
    case 'campaign_completed':
      return data?.campaign_id ? `/${role}/campaigns/${data.campaign_id}` : `/${role}/campaigns`;
    case 'payment':
      return `/${role === 'creator' ? 'creator/earnings' : 'advertiser/billing'}`;
    default:
      return `/${role}`;
  }
}

export default function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const roleRef = useRef('advertiser');

  // Detect role from URL
  useEffect(() => {
    roleRef.current = window.location.pathname.startsWith('/creator') ? 'creator' : 'advertiser';
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data || []);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.count || 0);
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications, fetchUnread]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAsRead = async (notif: any) => {
    if (!notif.read_at) {
      try {
        await api.put(`/notifications/${notif.id}/read`);
        setUnreadCount((c) => Math.max(0, c - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n))
        );
      } catch {}
    }
    const link = getLink(notif.type, notif.data, roleRef.current);
    setOpen(false);
    router.push(link);
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => (n.read_at ? n : { ...n, read_at: new Date().toISOString() }))
      );
    } catch {}
  };

  const unread = notifications.filter((n) => !n.read_at);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-500" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] font-bold rounded-full flex items-center justify-center min-w-[18px] min-h-[18px] px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15, ease: [0.25, 0.1, 0, 1] }}
            className="absolute left-0 top-full mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-bold text-black">الإشعارات</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-black text-white px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unread.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] text-gray-400 hover:text-black transition-colors flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  تحديد الكل كمقروء
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-sm text-gray-400">جاري التحميل...</div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4">
                  <Inbox className="w-8 h-8 text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">لا توجد إشعارات</p>
                  <p className="text-xs text-gray-300 mt-1">عند حصول حدث جديد، ستظهر الإشعارات هنا</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.slice(0, 20).map((notif: any) => {
                    const config = typeConfig[notif.type] || { label: notif.type, icon: Bell, color: 'text-gray-500 bg-gray-50' };
                    const Icon = config.icon;
                    const isUnread = !notif.read_at;
                    const data = notif.data || {};
                    return (
                      <button
                        key={notif.id}
                        onClick={() => markAsRead(notif)}
                        className={`w-full text-right px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                          isUnread ? 'bg-gray-50/50' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${config.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${isUnread ? 'font-bold text-black' : 'text-gray-600'}`}>
                            {data.advertiser_name || data.message || config.label}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {data.campaign_title && `${data.campaign_title} · `}
                            {timeAgo(notif.created_at)}
                          </p>
                        </div>
                        {isUnread && (
                          <div className="w-2 h-2 rounded-full bg-black shrink-0 mt-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 text-center">
              <button
                onClick={() => { setOpen(false); fetchNotifications(); fetchUnread(); }}
                className="text-[11px] text-gray-400 hover:text-black transition-colors"
              >
                تحديث
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
