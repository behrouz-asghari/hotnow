"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  async function handleRefresh() {
    setMessage("");

    try {
      const res = await fetch("/api/refresh", {
        method: "POST",
      });

      if (!res.ok) {
        setMessage("خطا در بروزرسانی داده‌ها");
        return;
      }

      startTransition(() => {
        router.refresh();
      });

      setMessage("داده‌ها بروزرسانی شدند");
    } catch {
      setMessage("ارتباط با سرور برقرار نشد");
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleRefresh}
        disabled={isPending}
        className="px-4 py-2 rounded-lg bg-black text-white text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "در حال بروزرسانی..." : "دریافت مجدد داده‌ها"}
      </button>

      {message ? (
        <p className="text-xs text-gray-500">{message}</p>
      ) : null}
    </div>
  );
}
