"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Circle } from "lucide-react";
import { AnalysisJobResponse, stepLabels } from "../lib/types";

const STEPS_ORDER: AnalysisJobResponse["step"][] = [
  "starting",
  "fetching_sources",
  "fusing_data",
  "clustering",
  "sentiment_forecast",
  "building_prompts",
  "generating_reports",
  "completed",
];

function getStepIndex(current: AnalysisJobResponse["step"]): number {
  return STEPS_ORDER.indexOf(current);
}

export default function AnalysisProgress({ job }: { job: AnalysisJobResponse }) {
  const currentIdx = getStepIndex(job.step);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#334155] bg-[#1e293b] p-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">در حال تحلیل داده‌ها</h2>
            <p className="mt-1 text-sm text-slate-400">
              {stepLabels[job.step] ?? job.message}
            </p>
          </div>
          <div className="text-sm font-medium text-slate-300">{job.progress}%</div>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-[#334155]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500"
            initial={{ width: 0 }}
            animate={{ width: `${job.progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ boxShadow: "0 0 10px rgba(59,130,246,0.5)" }}
          />
        </div>

        <p className="mt-3 text-sm text-slate-400">{job.message}</p>

        {/* Stage indicators */}
        <div className="mt-4 flex flex-wrap gap-2">
          {STEPS_ORDER.slice(0, -1).map((step, idx) => {
            const isDone = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            return (
              <span
                key={step}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                  isDone
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : isCurrent
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      : "bg-slate-700/50 text-slate-500 border border-slate-600/30"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : isCurrent ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Circle className="w-3 h-3" />
                )}
                {stepLabels[step]}
              </span>
            );
          })}
        </div>
      </section>
    </div>
  );
}
