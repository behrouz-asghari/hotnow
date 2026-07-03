export default function Loading() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6" dir="rtl">
      <div className="text-center space-y-4">
        <div className="mx-auto h-10 w-10 rounded-full border-4 border-gray-200 border-t-red-500 animate-spin" />
        <div className="space-y-2">
          <p className="text-lg font-bold text-gray-800">
            در حال آماده‌سازی تحلیل‌ها...
          </p>
          <p className="text-sm text-gray-500">
            لطفاً چند لحظه صبر کنید
          </p>
        </div>
      </div>
    </main>
  );
}
