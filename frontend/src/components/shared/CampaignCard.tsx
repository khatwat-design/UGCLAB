'use client';

import { motion } from 'framer-motion';
import { Clock, DollarSign, Users, Play, BadgeCheck, Lock } from 'lucide-react';
import { formatCurrency, timeAgo } from '@/lib/utils';

interface CampaignCardProps {
  campaign: {
    id: number;
    title: string;
    description: string;
    budget: number;
    category: string;
    end_date: string;
    max_creators: number;
    applications_count?: number;
    advertiser?: {
      id: number;
      name: string;
      avatar?: string | null;
    };
    status: string;
    requirements?: string[];
    created_at: string;
  };
  onApply: (campaign: any) => void;
  isCreator?: boolean;
  hasTier?: string;
}

export default function CampaignCard({ campaign, onApply, isCreator = true, hasTier }: CampaignCardProps) {
  const remainingSeats = campaign.max_creators ? campaign.max_creators - (campaign.applications_count || 0) : null;
  const isExpired = campaign.end_date ? new Date(campaign.end_date) < new Date() : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card hover:border-gray-300 transition-all hover:shadow-md group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-black text-lg">{campaign.title}</h3>
            {campaign.category && (
              <span className="text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full font-medium">
                {campaign.category}
              </span>
            )}
            {isExpired && (
              <span className="text-[11px] text-red-500 bg-red-50 px-2 py-0.5 rounded-full font-medium">
                منتهية
              </span>
            )}
            {hasTier && (
              <span className="text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <BadgeCheck className="w-3 h-3" />
                {hasTier}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{campaign.description}</p>

          <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-gray-700 font-medium">{formatCurrency(campaign.budget)}</span>
            </span>
            {campaign.end_date && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                {new Date(campaign.end_date).toLocaleDateString('ar-IQ')}
              </span>
            )}
            {remainingSeats !== null && (
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                {remainingSeats > 0 ? `متبقي ${remainingSeats} مقاعد` : 'مكتمل'}
              </span>
            )}
          </div>

          {campaign.advertiser && (
            <div className="flex items-center gap-2 pt-1">
              <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden">
                {campaign.advertiser.avatar ? (
                  <img src={campaign.advertiser.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                    {campaign.advertiser.name?.charAt(0)}
                  </div>
                )}
              </div>
              <span className="text-[11px] text-gray-400">{campaign.advertiser.name}</span>
              <span className="text-[10px] text-gray-300 mr-auto">{timeAgo(campaign.created_at)}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 shrink-0">
          <button
            onClick={() => onApply(campaign)}
            disabled={isExpired || (remainingSeats !== null && remainingSeats <= 0)}
            className="btn-primary text-sm whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isExpired || (remainingSeats !== null && remainingSeats <= 0) ? (
              <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> غير متاح</span>
            ) : (
              <span className="flex items-center gap-1"><Play className="w-3.5 h-3.5" /> تقدم الآن</span>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
