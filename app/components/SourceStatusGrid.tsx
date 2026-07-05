"use client";

import { CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";
import type { SourceStatus } from "../lib/types";

const STATUS_CONFIG: Record<SourceStatus, { text: string; color: string; icon: React.ElementType }> = {
  online: { text: "تکمیل", color: "text-emerald-400", icon: CheckCircle2 },
  empty: { text: "بدون داده", color: "text-amber-400", icon: AlertTriangle },
  error: { text: "خطا", color: "text-rose-400", icon: XCircle },
  timeout: { text: "تایم‌اوت", color: "text-orange-400", icon: Clock },
};

export default function SourceStatusGrid({
  sources,
}: {
  sources: Array<[string, SourceStatus]>;
}) {
  return (
    <section className="rounded-2xl border border-[#334155] bg-[#1e293b] p-6">
      <h3 className="mb-4 text-base font-semibold text-slate-200">وضعیت منابع</h3>
      <div className="grid gap-3 md:grid-cols-2">
        {sources.length === 0 ? (
          <div className="text-sm text-slate-500">هنوز وضعیتی ثبت نشده است.</div>
        ) : (
          sources.map(([name, status]) => {
            const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.error;
            const Icon = config.icon;
            return (
              <div
                key={name}
                className="flex items-center justify-between rounded-xl border border-[#334155] bg-[#0f172a] px-4 py-3 hover:border-[#475569] transition-colors"
              >
                <span className="font-medium capitalize text-slate-200">{name}</span>
                <span className={`text-sm font-medium flex items-center gap-1.5 ${config.color}`}>
                  <Icon className="w-4 h-4" />
                  {config.text}
                </span>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
