'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white" dir="rtl">
      <div className="text-center space-y-6 px-4">
        <div className="text-[120px] font-black text-gray-900 leading-none">404</div>
        <h1 className="text-2xl font-bold text-black">الصفحة غير موجودة</h1>
        <p className="text-gray-500 max-w-md mx-auto">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
        >
          العودة إلى الرئيسية
        </Link>
      </div>
    </div>
  );
}
