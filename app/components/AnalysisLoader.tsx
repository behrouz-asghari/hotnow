"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import StatCards from "./StatCards";
import AnalysisPanel from "./AnalysisPanel";

type SourceStatus = "pending" | "running" | "done" | "error";

type AnalysisResult = {
  generatedAt: string;
  items: any[];
  labels: any;
  sentiment: any;
  forecast: any;
  reports: {
    generalReport: string;
    womenSocialReport: string;
    marketReport: string;
  };
  sourceBreakdown: {
    google: number;
    wiki: number;
    ninisite: number;
    digikala: number;
  };
};

type AnalysisJobResponse = {
  id: string;
  status: "queued" | "running" | "done" | "error";
  progress: number;
  step:
    | "starting"
    | "fetching_sources"
    | "fusing_data"
    | "clustering"
    | "sentiment_forecast"
    | "building_prompts"
    | "generating_reports"
    | "completed"
    | "failed";
  message: string;
  data: AnalysisResult | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
  sources?: {
    google: SourceStatus;
    wiki: SourceStatus;
    ninisite: SourceStatus;
    digikala: SourceStatus;
  };
};

const stepLabels: Record<AnalysisJobResponse["step"], string> = {
  starting: "شروع تحلیل",
  fetching_sources: "دریافت داده از منابع",
  fusing_data: "ادغام و نرمال‌سازی",
  clustering: "خوشه‌بندی و برچسب‌گذاری",
  sentiment_forecast: "تحلیل احساسات و پیش‌بینی",
  building_prompts: "آماده‌سازی پرامپت‌ها",
  generating_reports: "تولید گزارش نهایی",
  completed: "تکمیل شد",
  failed: "خطا",
};

export default function AnalysisLoader() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<AnalysisJobResponse | null>(null);
  const [bootError, setBootError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const sourceEntries = useMemo(() => {
    if (!job?.sources) return [];
    return Object.entries(job.sources) as Array<[string, SourceStatus]>;
  }, [job?.sources]);

  async function startAnalysis() {
    setBootError(null);
    setJob(null);
    setJobId(null);

    const res = await fetch("/api/analyze/start", {
      method: "POST",
    });

    if (!res.ok) {
      throw new Error("شروع تحلیل ناموفق بود");
    }

    const data = await res.json();
    setJobId(data.jobId);
  }

  useEffect(() => {
    startAnalysis().catch((error) => {
      setBootError(String(error));
    });
  }, []);

  useEffect(() => {
    if (!jobId) return;

    async function fetchStatus() {
      const res = await fetch(`/api/analyze/status?jobId=${jobId}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("دریافت وضعیت تحلیل ناموفق بود");
      }

      const data: AnalysisJobResponse = await res.json();
      setJob(data);

      if (data.status === "done" || data.status === "error") {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    }

    fetchStatus().catch((error) => {
      setBootError(String(error));
    });

    intervalRef.current = setInterval(() => {
      fetchStatus().catch((error) => {
        setBootError(String(error));
      });
    }, 1500);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [jobId]);

  if (bootError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="mb-2 text-sm font-medium text-red-700">خطا</div>
        <div className="text-sm text-red-600">{bootError}</div>

        <button
          onClick={() => startAnalysis().catch((error) => setBootError(String(error)))}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="text-sm text-slate-700">در حال شروع تحلیل...</div>
      </div>
    );
  }

  if (job.status === "done" && job.data) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          تحلیل با موفقیت تکمیل شد
        </div>


<section className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">🔥 داشبورد AI ترندها</h1>
        <span className="text-xs text-gray-500">
          بروزرسانی: {new Date(job.data.generatedAt).toLocaleString("fa-IR")}
        </span>
      </header>

      <StatCards
        fear={job.data.sentiment.fear}
        excitement={job.data.sentiment.excitement}
        crisis={job.data.sentiment.crisis}
        sexualSignal={job.data.sentiment.sexualSignal}
        polarity={job.data.sentiment.polarity}
        politicalTension={job.data.sentiment.politicalTension}
      />

      <AnalysisPanel
        generalReport={job.data.reports.generalReport}
        womenSocialReport={job.data.reports.womenSocialReport}
        marketReport={job.data.reports.marketReport}
      />

      {/* <TrendsTable items={data.items} labels={data.labels} /> */}
    </section>

      </div>
    );
  }

  if (job.status === "error") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="mb-2 text-sm font-medium text-red-700">
          تحلیل با خطا متوقف شد
        </div>
        <div className="text-sm text-red-600">{job.error ?? job.message}</div>

        <button
          onClick={() => startAnalysis().catch((error) => setBootError(String(error)))}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">در حال تحلیل داده‌ها</h2>
            <p className="mt-1 text-sm text-slate-500">
              {stepLabels[job.step] ?? job.message}
            </p>
          </div>

          <div className="text-sm font-medium text-slate-700">
            {job.progress}%
          </div>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500 text-gray-700"
            style={{ width: `${job.progress}%` }}
          />
        </div>

        <p className="mt-3 text-sm text-slate-600">{job.message}</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-base font-semibold text-gray-700">وضعیت منابع</h3>

        <div className="grid gap-3 md:grid-cols-2">
          {sourceEntries.length === 0 ? (
            <div className="text-sm text-slate-500">هنوز وضعیتی ثبت نشده است.</div>
          ) : (
            sourceEntries.map(([name, status]) => (
              <div
                key={name}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"
              >
                <span className="font-medium capitalize text-gray-700">{name}</span>
                <span className="text-sm text-gray-700">
                  {status === "done"
                    ? "✅ تکمیل"
                    : status === "running"
                    ? "⏳ در حال اجرا"
                    : status === "error"
                    ? "❌ خطا"
                    : "• در انتظار"}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
