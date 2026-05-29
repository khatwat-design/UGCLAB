'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function LandingNavbar() {
  const [visible, setVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    heroRef.current = document.getElementById('hero');
    const hero = heroRef.current;
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        visible
          ? 'opacity-100 pointer-events-auto translate-y-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm'
          : 'opacity-0 pointer-events-none -translate-y-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex-shrink-0">
            <img src="/logo.PNG" alt="UGCLab" className="h-12 sm:h-14 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            <Link href="/#features" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
              المميزات
            </Link>
            <Link href="/#how-it-works" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
              كيف تعمل
            </Link>
            <Link href="/explore" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
              استكشف
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-black transition-colors px-4 py-2"
            >
              تسجيل دخول
            </Link>
            <Link
              href="/register"
              className="text-sm font-bold px-6 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all hover:shadow-lg"
            >
              إنشاء حساب
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-black"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-6 border-t border-gray-100">
            <div className="flex flex-col gap-3 pt-4 px-2">
              <Link href="/#features" className="text-sm text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>المميزات</Link>
              <Link href="/#how-it-works" className="text-sm text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>كيف تعمل</Link>
              <Link href="/explore" className="text-sm text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>استكشف</Link>
              <div className="border-t border-gray-100 pt-3 mt-1 flex flex-col gap-2">
                <Link href="/login" className="text-sm text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>تسجيل دخول</Link>
                <Link href="/register" className="text-sm font-bold px-3 py-2.5 bg-black text-white rounded-xl text-center" onClick={() => setIsMenuOpen(false)}>إنشاء حساب</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
