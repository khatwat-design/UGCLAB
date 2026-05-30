'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Megaphone,
  FileText,
  DollarSign,
  MessageSquare,
  Users,
  BarChart3,
  Settings,
  Shield,
  ShieldCheck,
  Send,
} from 'lucide-react';

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const creatorLinks: SidebarLink[] = [
  { href: '/creator', label: 'لوحة البيانات', icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/creator/campaigns', label: 'الحملات المتاحة', icon: <Megaphone className="w-5 h-5" /> },
  { href: '/creator/applications', label: 'طلباتي', icon: <FileText className="w-5 h-5" /> },
  { href: '/creator/portfolio', label: 'معرض الأعمال', icon: <BarChart3 className="w-5 h-5" /> },
  { href: '/creator/earnings', label: 'الأرباح', icon: <DollarSign className="w-5 h-5" /> },
  { href: '/creator/messages', label: 'الرسائل', icon: <MessageSquare className="w-5 h-5" /> },
  { href: '/creator/settings', label: 'الإعدادات', icon: <Settings className="w-5 h-5" /> },
];

const advertiserLinks: SidebarLink[] = [
  { href: '/advertiser', label: 'لوحة البيانات', icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/advertiser/campaigns', label: 'حملاتي', icon: <Megaphone className="w-5 h-5" /> },
  { href: '/advertiser/creators', label: 'المبدعين', icon: <Users className="w-5 h-5" /> },
  { href: '/advertiser/billing', label: 'الفواتير', icon: <DollarSign className="w-5 h-5" /> },
  { href: '/advertiser/messages', label: 'الرسائل', icon: <MessageSquare className="w-5 h-5" /> },
  { href: '/advertiser/settings', label: 'الإعدادات', icon: <Settings className="w-5 h-5" /> },
];

const adminLinks: SidebarLink[] = [
  { href: '/admin', label: 'لوحة البيانات', icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/admin/kyc', label: 'توثيق الحسابات', icon: <Shield className="w-5 h-5" /> },
  { href: '/admin/users', label: 'المستخدمين', icon: <Users className="w-5 h-5" /> },
  { href: '/admin/campaigns', label: 'الحملات', icon: <Megaphone className="w-5 h-5" /> },
  { href: '/admin/payments', label: 'المدفوعات', icon: <DollarSign className="w-5 h-5" /> },
  { href: '/admin/settlement-requests', label: 'طلبات التسوية', icon: <Send className="w-5 h-5" /> },
  { href: '/admin/logs', label: 'سجل النشاطات', icon: <FileText className="w-5 h-5" /> },
];

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();

  const links = role === 'creator' ? creatorLinks
    : role === 'advertiser' ? advertiserLinks
    : adminLinks;

  return (
    <aside className="w-64 border-l border-gray-200 bg-white min-h-[calc(100vh-4rem)] hidden lg:flex flex-col py-4 px-3 sticky top-16">
      <div className="flex flex-col gap-1">
        {links.map((link) => {
          const isActive = pathname === link.href ||
            (link.href !== `/${role}` && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'sidebar-link',
                isActive && 'sidebar-link-active'
              )}
            >
              {link.icon}
              <span>{link.label}</span>
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="mr-auto w-1 h-5 rounded-full bg-white"
                />
              )}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-100">
        <p className="text-[10px] text-gray-300 text-center">UGCLab © 2026</p>
      </div>
    </aside>
  );
}
