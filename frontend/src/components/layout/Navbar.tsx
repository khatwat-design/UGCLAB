'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { LogOut, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <nav className="h-16 border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        <Link href="/" className="flex-shrink-0">
          <img src="/logo.PNG" alt="UGCLab" className="h-12 w-auto" />
        </Link>

        <div className="flex items-center gap-3">
          <NotificationBell />

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2.5 pl-3 pr-2 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-xs font-bold text-white">
                {user?.name?.[0] || '?'}
              </div>
              <span className="text-sm text-gray-700 hidden sm:block">{user?.name}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {menuOpen && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-black">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  تسجيل خروج
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
