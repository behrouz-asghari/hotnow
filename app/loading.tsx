"use client";

import { useEffect, useState } from "react";

export default function Loading() {
  const [showLongWait, setShowLongWait] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowLongWait(true), 15000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6" dir="rtl">
      <div className="text-center space-y-6">
        {/* Animated gradient ring */}
        <div className="relative mx-auto h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-[#334155]" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-violet-500 animate-spin" />
          <div
            className="absolute inset-2 rounded-full border-4 border-transparent border-t-cyan-500 animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          />
        </div>
        <div className="space-y-2">
          <p className="text-lg font-bold text-slate-100">
            در حال آماده‌سازی تحلیل‌ها...
          </p>
          <p className="text-sm text-slate-400">
            لطفاً چند لحظه صبر کنید
          </p>
          {showLongWait && (
            <p className="text-sm text-amber-400 animate-pulse">
              بارگذاری طولانی‌تر از حد انتظار است...
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
