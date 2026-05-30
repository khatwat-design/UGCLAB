'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import Link from 'next/link';
import VerifiedBadge from '@/components/shared/VerifiedBadge';
import {
  ArrowLeft, Users, BarChart3, Globe, Send, MessageSquare, Star,
  Camera, Film, Tv, ExternalLink, Calendar, DollarSign, CheckCircle, Image,
} from 'lucide-react';
import { CreatorDetailSkeleton } from '@/components/shared/Skeleton';

const platformIcons: Record<string, any> = {
  instagram: Camera, youtube: Film, tiktok: Tv, twitter: Globe, snapchat: Tv,
};

export default function CreatorProfile() {
  const { id } = useParams();
  const router = useRouter();
  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get(`/creators/${id}`)
      .then((r) => setCreator(r.data))
      .catch(() => toast.error('حدث خطأ'))
      .finally(() => setLoading(false));
  }, [id]);

  const inviteCreator = async () => {
    setInviting(true);
    try {
      await api.post(`/advertiser/invite/${id}`);
      toast.success('تم إرسال الدعوة');
    } catch {
      toast.error('حدث خطأ');
    } finally {
      setInviting(false);
    }
  };

  if (loading) return <CreatorDetailSkeleton />;

  if (!creator) return (
    <div className="text-center py-20">
      <p className="text-gray-400">المبدع غير موجود</p>
      <Link href="/advertiser/creators" className="text-sm text-black font-bold underline underline-offset-2 mt-2 inline-block">
        العودة إلى المبدعين
      </Link>
    </div>
  );

  const profile = creator.creator_profile || {};

  return (
    <div className="max-w-4xl space-y-6">
      <Toaster position="top-center" />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-black">الملف الشخصي</h1>
          <p className="text-sm text-gray-400">معلومات المبدع وأعماله</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl border border-gray-200 p-6"
      >
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {creator.avatar ? (
            <img src={creator.avatar} alt="" className="w-20 h-20 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center text-2xl font-bold text-white shrink-0">
              {creator.name?.[0] || '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold text-black">{creator.name}</h2>
              {profile.is_verified && <VerifiedBadge />}
              <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{profile.category || 'عام'}</span>
              <button
                onClick={() => setSaved(!saved)}
                className={`transition-colors ${saved ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}
              >
                <Star className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} />
              </button>
            </div>
            {profile.bio && <p className="text-sm text-gray-500 mt-2 leading-relaxed">{profile.bio}</p>}
            {!profile.bio && <p className="text-sm text-gray-300 mt-2 italic">لا توجد نبذة</p>}
          </div>
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white rounded-xl border border-gray-200 p-4 text-center"
        >
          <Users className="w-5 h-5 text-gray-400 mx-auto mb-1.5" />
          <p className="text-lg font-bold text-black">{profile.followers_count?.toLocaleString() || 0}</p>
          <p className="text-[11px] text-gray-400">متابع</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-200 p-4 text-center"
        >
          <BarChart3 className="w-5 h-5 text-gray-400 mx-auto mb-1.5" />
          <p className="text-lg font-bold text-black">{profile.engagement_rate || 0}%</p>
          <p className="text-[11px] text-gray-400">معدل التفاعل</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-white rounded-xl border border-gray-200 p-4 text-center"
        >
          <Globe className="w-5 h-5 text-gray-400 mx-auto mb-1.5" />
          <p className="text-lg font-bold text-black">{profile.platforms?.length || 0}</p>
          <p className="text-[11px] text-gray-400">منصات</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="bg-white rounded-xl border border-gray-200 p-4 text-center"
        >
          <CheckCircle className="w-5 h-5 text-gray-400 mx-auto mb-1.5" />
          <p className="text-lg font-bold text-black">{profile.completed_campaigns || 0}</p>
          <p className="text-[11px] text-gray-400">حملات منجزة</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-2"
      >
        <button
          onClick={inviteCreator}
          disabled={inviting}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-black text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {inviting ? 'جاري...' : 'دعوة إلى حملة'}
        </button>
        <Link
          href={`/advertiser/messages?userId=${creator.id}`}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-5 py-3 rounded-xl text-sm font-bold border border-gray-200 hover:border-gray-400 hover:text-black transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          مراسلة
        </Link>
      </motion.div>

      {profile.platforms?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="bg-white rounded-xl border border-gray-200 p-5"
        >
          <h3 className="text-sm font-bold text-black mb-3">المنصات</h3>
          <div className="flex flex-wrap gap-2">
            {profile.platforms.map((p: string, i: number) => {
              const Icon = platformIcons[p.toLowerCase()] || Globe;
              return (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 text-xs text-gray-600 border border-gray-100">
                  <Icon className="w-3.5 h-3.5" />
                  {p}
                </span>
              );
            })}
          </div>
        </motion.div>
      )}

      {profile.portfolio_links?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 p-5"
        >
          <h3 className="text-sm font-bold text-black mb-3">أعمال سابقة</h3>
          <div className="space-y-2">
            {profile.portfolio_links.map((link: string, i: number) => (
              <a
                key={i}
                href={link}
                target="_blank"
                className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-black" />
                <span className="text-sm text-gray-600 group-hover:text-black truncate">{link}</span>
              </a>
            ))}
          </div>
        </motion.div>
      )}

      {creator.portfolio_items?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-black">معرض الأعمال</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {creator.portfolio_items.map((item: any) => (
              <div key={item.id} className="group relative">
                {item.image_url ? (
                  <div className="aspect-square rounded-lg bg-gray-100 overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.title || ''}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg bg-gray-50 flex items-center justify-center">
                    <Image className="w-6 h-6 text-gray-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-lg transition-all flex items-end p-3">
                  <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.title && <p className="text-xs font-bold truncate">{item.title}</p>}
                    {item.link_url && (
                      <a href={item.link_url} target="_blank" className="text-[10px] underline underline-offset-1 inline-block mt-0.5">
                        عرض الرابط
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {creator.completed_campaigns?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="bg-white rounded-xl border border-gray-200 p-5"
        >
          <h3 className="text-sm font-bold text-black mb-3">آخر الحملات المنفذة</h3>
          <div className="space-y-2">
            {creator.completed_campaigns.map((c: any) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-black">{c.title}</p>
                  <p className="text-xs text-gray-400">{c.category} · ${c.budget}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
