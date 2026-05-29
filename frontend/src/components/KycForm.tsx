'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
  Shield, Upload, FileText, CheckCircle, XCircle, AlertCircle, ExternalLink, BadgeCheck,
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

const kycLabels: Record<string, { label: string; classes: string }> = {
  not_submitted: { label: 'لم يتم التقديم', classes: 'bg-gray-100 text-gray-500' },
  pending: { label: 'قيد المراجعة', classes: 'bg-amber-50 text-amber-700' },
  verified: { label: 'موثق', classes: 'bg-green-50 text-green-700' },
  rejected: { label: 'مرفوض', classes: 'bg-red-50 text-red-600' },
};

const docTypeLabels: Record<string, string> = {
  id_card: 'بطاقة هوية',
  passport: 'جواز سفر',
  business_license: 'سجل تجاري',
  portfolio: 'أعمال سابقة',
};

const requiredDocs: Record<string, string[]> = {
  creator: ['id_card', 'portfolio'],
  advertiser: ['id_card', 'business_license'],
};

export default function KycForm({ role, onVerified }: { role?: string; onVerified?: () => void }) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState('');
  const [kycStatus, setKycStatus] = useState<string>('not_submitted');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = () => {
    api.get('/kyc/my-documents').then((r) => {
      const docs = r.data || [];
      setDocuments(docs);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDocuments();
    api.get('/auth/me').then((r) => setKycStatus(r.data.kyc_status || 'not_submitted'));
  }, []);

  const docStatus = (type: string) => {
    const doc = documents.find((d) => d.document_type === type);
    return doc?.status || 'not_submitted';
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadType) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', uploadType);
      await api.post('/kyc/upload', formData);
      toast.success('تم رفع المستند بنجاح');
      setUploadType('');
      fetchDocuments();
      api.get('/auth/me').then((r) => setKycStatus(r.data.kyc_status || 'not_submitted'));
      onVerified?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل رفع المستند');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerUpload = (type: string) => {
    setUploadType(type);
    setTimeout(() => fileInputRef.current?.click(), 0);
  };

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  const getDocUrl = (docId: number) => `${apiBase}/kyc/documents/${docId}`;

  const userRole = role || 'creator';
  const docsNeeded = requiredDocs[userRole] || [];

  if (kycStatus === 'verified') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <BadgeCheck className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <p className="text-sm font-bold text-green-800 mb-1">تم توثيق حسابك بنجاح</p>
        <p className="text-xs text-green-600">حسابك موثق بالكامل. يمكنك الاستفادة من جميع مزايا المنصة.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Banner */}
      <div className={`rounded-xl border p-4 flex items-start gap-3 ${
        kycStatus === 'rejected' ? 'bg-red-50 border-red-200' :
        kycStatus === 'pending' ? 'bg-amber-50 border-amber-200' :
        'bg-gray-50 border-gray-200'
      }`}>
        {kycStatus === 'rejected' ? (
          <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
        )}
        <div>
          <p className={`text-sm font-bold ${
            kycStatus === 'rejected' ? 'text-red-800' : 'text-amber-800'
          }`}>{kycLabels[kycStatus]?.label}</p>
          <p className={`text-xs mt-0.5 ${
            kycStatus === 'rejected' ? 'text-red-600' : 'text-amber-600'
          }`}>
            {kycStatus === 'not_submitted' && 'يرجى رفع المستندات المطلوبة أدناه'}
            {kycStatus === 'pending' && 'مستنداتك قيد المراجعة من قبل فريق التوثيق'}
            {kycStatus === 'rejected' && 'لم يتم الموافقة على مستنداتك. يرجى رفع مستندات جديدة'}
          </p>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-bold text-black mb-4">المستندات المطلوبة</h3>

        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner className="h-8 w-auto" />
          </div>
        ) : (
          <div className="space-y-3">
            {docsNeeded.map((type) => {
              const status = docStatus(type);
              const doc = documents.find((d) => d.document_type === type);
              return (
                <div key={type} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-black">{docTypeLabels[type]}</p>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full mt-1 ${
                          status === 'approved' ? 'bg-green-50 text-green-700' :
                          status === 'rejected' ? 'bg-red-50 text-red-600' :
                          status === 'pending' ? 'bg-amber-50 text-amber-700' :
                          'bg-gray-100 text-gray-400'
                        }`}>
                          {status === 'approved' && <CheckCircle className="w-3 h-3" />}
                          {status === 'rejected' && <XCircle className="w-3 h-3" />}
                          {status === 'approved' ? 'مقبول' :
                           status === 'rejected' ? 'مرفوض' :
                           status === 'pending' ? 'قيد المراجعة' : 'لم يتم الرفع'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc && (
                        <a href={getDocUrl(doc.id)} target="_blank" className="text-xs text-gray-500 hover:text-black inline-flex items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {status !== 'approved' && (
                        <button
                          onClick={() => triggerUpload(type)}
                          disabled={uploading}
                          className="text-xs px-3 py-1.5 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                        >
                          <Upload className="w-3 h-3" /> رفع
                        </button>
                      )}
                    </div>
                  </div>
                  {doc?.admin_notes && (
                    <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded-lg">
                      ملاحظات المشرف: {doc.admin_notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" className="hidden" onChange={handleFileSelect} />
      </div>
    </div>
  );
}
