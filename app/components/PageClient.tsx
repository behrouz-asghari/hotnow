"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { AnalyzeResponse } from "../lib/types";
import StatCards from "./StatCards";
import AnalysisPanel from "./AnalysisPanel";
import RefreshButton from "./RefreshButton";
import TrendsLabelsBoard from "./TrendsLabelsBoard";

export default function PageClient({ data }: { data: AnalyzeResponse }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto p-6 space-y-6"
    >
      <header className="flex items-center justify-between gap-4">
        <div className="flex flex-row justify-between items-center gap-4 w-full">
          <h1 className="text-2xl font-extrabold bg-gradient-to-l from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-blue-400" />
            داشبورد AI ترندها
          </h1>
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

      <StatCards {...data.sentiment} />
      <TrendsLabelsBoard items={data.items} />
      <AnalysisPanel {...data.reports} />
    </motion.div>
  );
}
