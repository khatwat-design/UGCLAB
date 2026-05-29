export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white" dir="rtl">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-400">جاري التحميل...</p>
      </div>
    </div>
  );
}
