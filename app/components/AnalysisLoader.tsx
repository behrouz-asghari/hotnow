"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { useAnalysisJob } from "./useAnalysisJob";
import StatCards from "./StatCards";
import AnalysisPanel from "./AnalysisPanel";
import AnalysisProgress from "./AnalysisProgress";
import SourceStatusGrid from "./SourceStatusGrid";
import type { SourceStatus } from "../lib/types";

export default function AnalysisLoader() {
  const { job, error, pollErrors, start } = useAnalysisJob();

  const sourceEntries = useMemo(() => {
    if (!job?.sources) return [];
    return Object.entries(job.sources) as Array<[string, SourceStatus]>;
  }, [job?.sources]);

  // Critical boot error
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6"
      >
        <div className="mb-2 text-sm font-medium text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          خطا
        </div>
        <div className="text-sm text-rose-400">{error}</div>
        <button
          onClick={() => start()}
          className="mt-4 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm text-white hover:from-blue-500 hover:to-violet-500 transition-all shadow-lg shadow-blue-500/20"
        >
          تلاش مجدد
        </button>
      </motion.div>
    );
  }

  // Waiting for job to start
  if (!job) {
    return (
      <div className="rounded-2xl border border-[#334155] bg-[#1e293b] p-6">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <div className="text-sm text-slate-300">در حال شروع تحلیل...</div>
        </div>
      </div>
    );
  }

  // Done
  if (job.status === "done" && job.data) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300 flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          تحلیل با موفقیت تکمیل شد
        </motion.div>

        <section className="max-w-6xl mx-auto p-6 space-y-6">
          <header className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold bg-gradient-to-l from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              داشبورد AI ترندها
            </h1>
            <span className="text-xs text-slate-400">
              بروزرسانی: {new Date(job.data.generatedAt).toLocaleString("fa-IR")}
            </span>
          </header>

          <StatCards {...job.data.sentiment} />
          <AnalysisPanel {...job.data.reports} />
        </section>
      </div>
    );
  }

  // Error
  if (job.status === "error") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6"
      >
        <div className="mb-2 text-sm font-medium text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          تحلیل با خطا متوقف شد
        </div>
        <div className="text-sm text-rose-400">{job.error ?? job.message}</div>
        <button
          onClick={() => start()}
          className="mt-4 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm text-white hover:from-blue-500 hover:to-violet-500 transition-all shadow-lg shadow-blue-500/20"
        >
          تلاش مجدد
        </button>
      </motion.div>
    );
  }

  // In progress
  return (
    <div className="space-y-6">
      {/* Transient poll error warning */}
      {pollErrors >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-300 flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          مشکل موقتی در دریافت به‌روزرسانی. در حال تلاش مجدد...
        </motion.div>
      )}

      <AnalysisProgress job={job} />
      <SourceStatusGrid sources={sourceEntries} />
    </div>
  );
}
