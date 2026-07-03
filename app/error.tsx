"use client";

export default function ErrorPage() {
  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="bg-red-50 border border-red-200 rounded-xl p-10 text-center text-red-600">
        <p className="font-bold">⚠️ سرویس موقتاً در دسترس نیست</p>
        <p className="text-sm mt-2">
          هنوز داده معتبر برای ساخت صفحه آماده نشده. لطفاً چند دقیقه دیگر تلاش کنید.
        </p>
      </div>
    </main>
  );
}
