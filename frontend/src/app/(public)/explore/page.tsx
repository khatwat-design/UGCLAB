'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { CardGridSkeleton } from '@/components/shared/Skeleton';

export default function ExplorePage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/creator/campaigns')
      .then((r) => setCampaigns(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-black mb-2">استكشف الحملات</h1>
        <p className="text-gray-500 mb-8">تصفح الحملات المتاحة للمبدعين</p>

        {loading ? (
          <CardGridSkeleton count={6} />
        ) : campaigns.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign: any) => (
              <div key={campaign.id} className="card hover:shadow-md transition-shadow">
                <h3 className="font-bold text-black mb-2">{campaign.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-3">{campaign.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-black">${campaign.budget}</span>
                  <span className="text-gray-400">{campaign.category || 'عام'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400">لا توجد حملات متاحة حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
}
