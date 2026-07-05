"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!message) return;
    if (message.type === "success") {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  async function handleRefresh() {
    setMessage(null);

    try {
      const res = await fetch("/api/refresh", { method: "POST" });
      if (!res.ok) {
        setMessage({ text: "خطا در بروزرسانی داده‌ها", type: "error" });
        return;
      }
      startTransition(() => {
        router.refresh();
      });
      setMessage({ text: "بازسازی شد ✓", type: "success" });
    } catch {
      setMessage({ text: "ارتباط با سرور برقرار نشد", type: "error" });
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleRefresh}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-medium hover:from-blue-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
      >
        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        {isPending ? "در حال بروزرسانی..." : "دریافت مجدد داده‌ها"}
      </button>

      {message && (
        <p className={`text-xs ${message.type === "error" ? "text-rose-400" : "text-emerald-400"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
