'use client';

import Link from 'next/link';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white" dir="rtl">
      <div className="text-center space-y-6 px-4">
        <div className="text-[120px] font-black text-gray-200 leading-none">!</div>
        <h1 className="text-2xl font-bold text-black">حدث خطأ غير متوقع</h1>
        <p className="text-gray-500 max-w-md mx-auto">
          نأسف على هذا الإزعاج. يرجى المحاولة مرة أخرى.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-8 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            إعادة المحاولة
          </button>
          <Link
            href="/"
            className="px-8 py-3 border border-gray-200 text-black rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            العودة إلى الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
