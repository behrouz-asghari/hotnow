"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { History, BarChart3 } from "lucide-react";
import { AnalyzeResponse } from "../lib/types";
import StatCards from "./StatCards";
import AnalysisPanel from "./AnalysisPanel";
import RefreshButton from "./RefreshButton";
import TrendsLabelsBoard from "./TrendsLabelsBoard";
import HistoricalView from "./HistoricalView";
import Image from "next/image";

type Tab = "current" | "history";

export default function PageClient({ data }: { data: AnalyzeResponse }) {
  const [tab, setTab] = useState<Tab>("current");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto p-6 space-y-6"
    >
      <header className="flex items-center justify-between gap-4">
        <div className="flex flex-row justify-between items-center gap-4 w-full">
          <div className="flex items-center gap-1">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={50}
              height={50}
              className="object-contain"
            />
            <div className="flex flex-col items-start">

              <h1 className="text-1xl font-extrabold">
                داشبورد AI ترندها
              </h1>
              <span className="text-xs text-slate-400 block mt-1">تحلیل آنچه دیتای آزاد است</span>
            </div>

          </div>
          <div className="flex flex-col items-start gap-2">
            <span className="text-xs text-slate-400 block mt-1">
              {data.generatedAt
                ? `بروزرسانی: ${new Date(data.generatedAt).toLocaleString("fa-IR")}`
                : "زمان نامشخص"}
            </span>
            <RefreshButton />
          </div>
        </div>
      </header>

      {/* Tab Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("current")}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-xl border transition-all ${tab === "current"
            ? "bg-blue-500/15 border-blue-500/40 text-blue-300"
            : "border-[#334155] text-slate-400 hover:border-[#475569] hover:text-slate-300"
            }`}
        >
          <BarChart3 className="w-4 h-4" />
          تحلیل فعلی
        </button>
        <button
          onClick={() => setTab("history")}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-xl border transition-all ${tab === "history"
            ? "bg-violet-500/15 border-violet-500/40 text-violet-300"
            : "border-[#334155] text-slate-400 hover:border-[#475569] hover:text-slate-300"
            }`}
        >
          <History className="w-4 h-4" />
          تاریخچه
        </button>
      </div>

      {tab === "current" ? (
        <>
          <StatCards {...data.sentiment} />
          <TrendsLabelsBoard items={data.items} />
          <AnalysisPanel {...data.reports} />
        </>
      ) : (
        <HistoricalView />
      )}
    </motion.div>
  );
}
