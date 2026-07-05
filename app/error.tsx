"use client";

import { AlertTriangle } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0f172a] p-6">
      <div className="max-w-md w-full rounded-2xl border border-rose-500/20 bg-[#1e293b] p-8 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-100">خطا در بارگذاری داشبورد</h2>
        <p className="text-sm text-slate-400">
          {error?.message || "خطای غیرمنتظره‌ای رخ داد."}
        </p>
        <button
          onClick={reset}
          className="mt-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2 text-sm font-medium text-white hover:from-blue-500 hover:to-violet-500 transition-all shadow-lg shadow-blue-500/20"
        >
          تلاش مجدد
        </button>
      </div>
    </main>
  );
}
