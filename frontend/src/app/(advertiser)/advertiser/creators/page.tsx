'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import VerifiedBadge from '@/components/shared/VerifiedBadge';
import {
  Search, Users, BarChart3, Send, Filter, ArrowUpDown,
  Camera, Film, Tv, Globe, MessageSquare, Star,
} from 'lucide-react';
import { CreatorGridSkeleton } from '@/components/shared/Skeleton';

const platformIcons: Record<string, any> = {
  instagram: Camera, youtube: Film, tiktok: Tv, twitter: Globe, snapchat: Tv,
};

const categories = ['الكل', 'تقنية', 'سياحة', 'أكل', 'رياضة', 'أزياء', 'تعليم', 'ترفيه', 'أخبار'];

export default function DiscoverCreators() {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('الكل');
  const [genderFilter, setGenderFilter] = useState('');
  const [ageMinFilter, setAgeMinFilter] = useState('');
  const [ageMaxFilter, setAgeMaxFilter] = useState('');
  const [sortBy, setSortBy] = useState('followers');
  const [inviting, setInviting] = useState<number | null>(null);
  const [savedList, setSavedList] = useState<number[]>([]);

  useEffect(() => {
    setLoading(true);
    api.get('/creators').then((r) => setCreators(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const calcAge = (dob: string) => {
    if (!dob) return null;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const filtered = creators
    .filter((c: any) => {
      if (!search) return true;
      const profile = c.creator_profile || {};
      return c.name.includes(search) || profile.category?.includes(search);
    })
    .filter((c: any) => {
      if (categoryFilter === 'الكل') return true;
      return c.creator_profile?.category === categoryFilter;
    })
    .filter((c: any) => {
      if (!genderFilter) return true;
      return c.gender === genderFilter;
    })
    .filter((c: any) => {
      const age = calcAge(c.date_of_birth);
      if (!age) return !ageMinFilter && !ageMaxFilter;
      if (ageMinFilter && age < Number(ageMinFilter)) return false;
      if (ageMaxFilter && age > Number(ageMaxFilter)) return false;
      return true;
    })
    .sort((a: any, b: any) => {
      const pa = a.creator_profile || {};
      const pb = b.creator_profile || {};
      if (sortBy === 'followers') return (pb.followers_count || 0) - (pa.followers_count || 0);
      if (sortBy === 'engagement') return (pb.engagement_rate || 0) - (pa.engagement_rate || 0);
      return a.name?.localeCompare(b.name);
    });

  const inviteCreator = async (creatorId: number) => {
    setInviting(creatorId);
    try {
      await api.post(`/advertiser/invite/${creatorId}`);
      toast.success('تم إرسال دعوة للمبدع');
    } catch {
      toast.error('حدث خطأ');
    } finally {
      setInviting(null);
    }
  };

  const toggleSave = (creatorId: number) => {
    setSavedList((prev) =>
      prev.includes(creatorId) ? prev.filter((id) => id !== creatorId) : [...prev, creatorId]
    );
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="page-title">المبدعون</h1>
        <p className="page-subtitle">اكتشف وتواصل مع صناع المحتوى المناسبين لحملاتك</p>
      </motion.div>

      <div className="flex items-center gap-3 text-xs text-gray-400 bg-white rounded-xl border border-gray-200 p-3">
        <Users className="w-4 h-4" />
        <span><strong className="text-black">{creators.length}</strong> مبدع متاح</span>
        <span className="text-gray-200">|</span>
        <span><strong className="text-black">{categories.length - 1}</strong> تصنيف</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
      >
        <div className="relative w-full sm:w-72">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو التخصص..."
            className="pr-9 pl-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white w-full focus:border-black outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:border-black outline-none transition-colors"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:border-black outline-none transition-colors"
          >
            <option value="">كل الجنسين</option>
            <option value="male">ذكر</option>
            <option value="female">أنثى</option>
          </select>
          <input
            type="number"
            value={ageMinFilter}
            onChange={(e) => setAgeMinFilter(e.target.value)}
            placeholder="العمر من"
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white w-20 focus:border-black outline-none transition-colors"
            min="13"
            max="100"
          />
          <input
            type="number"
            value={ageMaxFilter}
            onChange={(e) => setAgeMaxFilter(e.target.value)}
            placeholder="العمر إلى"
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white w-20 focus:border-black outline-none transition-colors"
            min="13"
            max="100"
          />
          <button
            onClick={() => setSortBy(sortBy === 'followers' ? 'engagement' : sortBy === 'engagement' ? 'name' : 'followers')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-600 hover:border-gray-400 transition-all whitespace-nowrap"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            {sortBy === 'followers' ? 'المتابعين' : sortBy === 'engagement' ? 'التفاعل' : 'الاسم'}
          </button>
        </div>
      </motion.div>

      {loading ? (
        <CreatorGridSkeleton count={6} />
      ) : (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((creator: any, i: number) => {
          const profile = creator.creator_profile || {};
          const isSaved = savedList.includes(creator.id);
          return (
            <motion.div
              key={creator.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
            >
              <Link
                href={`/advertiser/creators/${creator.id}`}
                className="block p-5 pb-0"
              >
                <div className="flex items-center gap-3 mb-4">
                  {creator.avatar ? (
                    <img src={creator.avatar} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-base font-bold text-white shrink-0">
                      {creator.name?.[0] || '?'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-black truncate">{creator.name}</h3>
                      {profile.is_verified && <VerifiedBadge />}
                      <button
                        onClick={(e) => { e.preventDefault(); toggleSave(creator.id); }}
                        className={`shrink-0 transition-colors ${isSaved ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}
                      >
                        <Star className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">{profile.category || 'عام'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-0 text-xs text-gray-500 bg-gray-50 rounded-lg mb-3">
                  <div className="text-center py-2.5">
                    <Users className="w-3.5 h-3.5 mx-auto mb-0.5" />
                    <span className="font-medium text-black">{profile.followers_count?.toLocaleString() || 0}</span>
                  </div>
                  <div className="text-center py-2.5 border-x border-gray-200">
                    <BarChart3 className="w-3.5 h-3.5 mx-auto mb-0.5" />
                    <span className="font-medium text-black">{profile.engagement_rate || 0}%</span>
                  </div>
                  <div className="text-center py-2.5">
                    <Globe className="w-3.5 h-3.5 mx-auto mb-0.5" />
                    <span className="font-medium text-black">{profile.platforms?.length || 0}</span>
                  </div>
                </div>

                {profile.platforms?.length > 0 && (
                  <div className="flex gap-1.5 mb-3">
                    {profile.platforms.map((p: string, j: number) => {
                      const Icon = platformIcons[p.toLowerCase()] || Globe;
                      return (
                        <span key={j} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                          <Icon className="w-3 h-3 text-gray-500" />
                        </span>
                      );
                    })}
                  </div>
                )}

                {profile.portfolio_links?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {profile.portfolio_links.map((link: string, j: number) => (
                      <span key={j} className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full truncate max-w-[140px]">
                        {link.replace(/https?:\/\//, '')}
                      </span>
                    ))}
                  </div>
                )}
              </Link>

              <div className="flex gap-2 p-5 pt-3 border-t border-gray-100">
                <button
                  onClick={() => inviteCreator(creator.id)}
                  disabled={inviting === creator.id}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-white bg-black px-3 py-2 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
                >
                  <Send className="w-3 h-3" />
                  {inviting === creator.id ? 'جاري...' : 'دعوة للحملة'}
                </button>
                <Link
                  href={`/advertiser/messages?userId=${creator.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 hover:text-black transition-all border border-gray-100"
                >
                  <MessageSquare className="w-3 h-3" />
                  مراسلة
                </Link>
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16">
            <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              {creators.length === 0 ? 'لا يوجد مبدعون بعد' : 'لا توجد نتائج للبحث'}
            </p>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
