'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { Toaster, toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Plus, X, ExternalLink, Image, Pencil, Trash2, Upload, Video, Film,
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  is_video: boolean;
  sort_order: number;
}

export default function CreatorPortfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PortfolioItem | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedMediaId, setUploadedMediaId] = useState<number | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = () => {
    api.get('/portfolio').then((r) => setItems(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, []);

  const openCreate = () => {
    setEditing(null);
    setTitle('');
    setDescription('');
    setImageUrl('');
    setLinkUrl('');
    setUploadedMediaId(null);
    setIsVideo(false);
    setShowModal(true);
  };

  const openEdit = (item: PortfolioItem) => {
    setEditing(item);
    setTitle(item.title || '');
    setDescription(item.description || '');
    setImageUrl(item.image_url || '');
    setLinkUrl(item.link_url || '');
    setUploadedMediaId(null);
    setIsVideo(item.is_video || false);
    setShowModal(true);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('collection', 'portfolio');
      const res = await api.post('/media/upload', formData);
      const media = res.data;
      setUploadedMediaId(media.id);
      setImageUrl(media.url);
      setIsVideo(media.is_video);
      toast.success('تم رفع الملف');
    } catch {
      toast.error('فشل رفع الملف');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = { title, description, link_url: linkUrl };
      if (uploadedMediaId) {
        payload.media_id = uploadedMediaId;
      } else if (imageUrl && !uploadedMediaId) {
        payload.image_url = imageUrl;
      }
      payload.is_video = isVideo;
      if (editing) {
        await api.put(`/portfolio/${editing.id}`, payload);
        toast.success('تم تحديث العمل');
      } else {
        await api.post('/portfolio', payload);
        toast.success('تم إضافة العمل');
      }
      setShowModal(false);
      fetchItems();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا العمل؟')) return;
    try {
      await api.delete(`/portfolio/${id}`);
      toast.success('تم الحذف');
      fetchItems();
    } catch { toast.error('حدث خطأ'); }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">معرض الأعمال</h1>
          <p className="page-subtitle">أضف وأدر أعمالك السابقة (صور وفيديوهات)</p>
        </div>
        <button onClick={openCreate} className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> إضافة عمل
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Image className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400 mb-1">لا توجد أعمال في معرضك</p>
          <p className="text-xs text-gray-300 mb-4">أضف أعمالك السابقة لعرضها على المعلنين</p>
          <button onClick={openCreate} className="btn-primary text-sm">
            أضف أول عمل
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card group hover:border-gray-300 transition-all"
            >
              <div className="relative">
                {item.image_url ? (
                  <div className="h-44 rounded-lg bg-gray-900 overflow-hidden mb-3">
                    {item.is_video ? (
                      <video
                        src={item.image_url}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : (
                      <img
                        src={item.image_url}
                        alt={item.title || ''}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    {item.is_video && (
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Film className="w-3 h-3" /> فيديو
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-44 rounded-lg bg-gray-50 flex items-center justify-center mb-3">
                    <Image className="w-8 h-8 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(item)}
                    className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-black transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-sm text-black truncate">{item.title || 'بدون عنوان'}</h3>
              {item.description && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
              )}
              {item.link_url && (
                <a
                  href={item.link_url}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-black mt-2 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> عرض الرابط
                </a>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">{editing ? 'تعديل العمل' : 'إضافة عمل جديد'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">العنوان</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="عنوان العمل" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">رفع ملف (صورة أو فيديو)</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-gray-300 transition-colors"
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <LoadingSpinner className="h-8 w-auto" />
                    <span className="text-xs text-gray-400">جاري الرفع...</span>
                  </div>
                ) : imageUrl ? (
                  <div className="relative">
                    {isVideo ? (
                      <video src={imageUrl} className="max-h-32 mx-auto rounded-lg" controls />
                    ) : (
                      <img src={imageUrl} alt="" className="max-h-32 mx-auto rounded-lg" />
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setImageUrl(''); setUploadedMediaId(null); }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-gray-300" />
                    <span className="text-sm text-gray-400">اضغط لرفع صورة أو فيديو</span>
                    <span className="text-[10px] text-gray-300">JPG, PNG, WEBP, MP4, MOV - حد 100MB</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {imageUrl && !uploadedMediaId && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">أو رابط الصورة/الفيديو</label>
                <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="input-field" placeholder="https://example.com/media" dir="ltr" />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">الوصف</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field min-h-[80px]" placeholder="وصف العمل..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">الرابط</label>
              <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="input-field" placeholder="https://..." dir="ltr" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving || uploading} className="btn-primary flex-1 disabled:opacity-50">
                {saving ? 'جاري الحفظ...' : editing ? 'تحديث' : 'إضافة'}
              </button>
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
