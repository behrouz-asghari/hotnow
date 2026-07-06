"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ChevronDown, ChevronUp } from "lucide-react";

const SOURCES = [
  { key: "google", label: "گوگل", color: "#3b82f6" },
  { key: "wiki", label: "ویکی", color: "#94a3b8" },
  { key: "ninisite", label: "نی‌نی‌سایت", color: "#ec4899" },
  { key: "karzar", label: "کارزار", color: "#f59e0b" },
  { key: "digikala", label: "دیجی‌کالا", color: "#ef4444" },
  { key: "tgstat", label: "تلگرام", color: "#06b6d4" },
  { key: "filimo", label: "فیلیمو", color: "#f97316" },
];

interface TitleRecord {
  title: string;
  normalized_title: string;
  daysAppeared: number;
  firstSeen: string;
  lastSeen: string;
  bestScore: number | null;
  lastScore: number | null;
  dailyScores: { date: string; score: number | null }[];
}

interface SourceHistory {
  source: string;
  dates: string[];
  topTitles: TitleRecord[];
  totalItems: number;
}

function formatNumber(n: number | null): string {
  if (n == null) return "-";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
}

export default function HistoricalView() {
  const [activeSource, setActiveSource] = useState("google");
  const [data, setData] = useState<SourceHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [search, setSearch] = useState("");
  const [expandedTitle, setExpandedTitle] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ source: activeSource, days: String(days) });
    if (search) params.set("search", search);

    fetch(`/api/history?${params}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) {
          setData(null);
        } else {
          setData(json);
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [activeSource, days, search]);

  const sourceConfig = SOURCES.find((s) => s.key === activeSource) ?? SOURCES[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      {/* Source Tabs */}
      <div className="flex flex-wrap gap-2">
        {SOURCES.map((src) => (
          <button
            key={src.key}
            onClick={() => setActiveSource(src.key)}
            className={`px-4 py-2 text-xs rounded-xl border transition-all font-medium ${
              activeSource === src.key
                ? "border-opacity-40 text-white"
                : "border-[#334155] text-slate-400 hover:border-[#475569] hover:text-slate-300"
            }`}
            style={
              activeSource === src.key
                ? { backgroundColor: `${src.color}25`, borderColor: `${src.color}60`, color: src.color }
                : undefined
            }
          >
            {src.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-[#0f172a] rounded-lg border border-[#334155] px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="جستجو در عنوان ها..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-slate-200 outline-none w-48 placeholder:text-slate-500"
          />
        </div>
        <div className="flex items-center gap-1">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                days === d
                  ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                  : "border-[#334155] text-slate-400 hover:border-[#475569]"
              }`}
            >
              {d} روز
            </button>
          ))}
        </div>
        {data && (
          <span className="text-xs text-slate-500 mr-auto">
            {data.totalItems.toLocaleString("fa-IR")} مورد ذخیره شده
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <span className="mr-3 text-sm text-slate-400">در حال بارگذاری...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && (!data || data.dates.length === 0) && (
        <div className="text-center py-12 text-slate-500 text-sm">
          هنوز داده‌ای برای این منبع ذخیره نشده است.
        </div>
      )}

      {/* Titles Table */}
      {!loading && data && data.topTitles.length > 0 && (
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">
            عنوان ها برتر {sourceConfig.label} — {data.dates.length} روز
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#334155]">
                  <th className="text-right py-2 px-3 text-slate-400 font-medium">#</th>
                  <th className="text-right py-2 px-3 text-slate-400 font-medium">عنوان</th>
                  <th className="text-right py-2 px-3 text-slate-400 font-medium">روزهای حضور</th>
                  <th className="text-right py-2 px-3 text-slate-400 font-medium">اولین روز</th>
                  <th className="text-right py-2 px-3 text-slate-400 font-medium">آخرین روز</th>
                  <th className="text-right py-2 px-3 text-slate-400 font-medium">بهترین امتیاز</th>
                  <th className="text-right py-2 px-3 text-slate-400 font-medium">آخرین امتیاز</th>
                  <th className="text-right py-2 px-3 text-slate-400 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {data.topTitles.map((t, i) => {
                  const isExpanded = expandedTitle === t.normalized_title;
                  const persistencePercent = Math.round((t.daysAppeared / data.dates.length) * 100);

                  return (
                    <React.Fragment key={t.normalized_title}>
                      <tr
                        className="border-b border-[#334155]/50 hover:bg-[#0f172a]/50 cursor-pointer"
                        onClick={() => setExpandedTitle(isExpanded ? null : t.normalized_title)}
                      >
                        <td className="py-2 px-3 text-slate-500 w-8">{i + 1}</td>
                        <td className="py-2 px-3 text-slate-200 max-w-[250px] truncate">{t.title}</td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-[#334155] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${persistencePercent}%`,
                                  backgroundColor: sourceConfig.color,
                                }}
                              />
                            </div>
                            <span className="text-slate-300">{t.daysAppeared}/{data.dates.length}</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-slate-400">{t.firstSeen}</td>
                        <td className="py-2 px-3 text-slate-400">{t.lastSeen}</td>
                        <td className="py-2 px-3 text-slate-300 font-mono">{formatNumber(t.bestScore)}</td>
                        <td className="py-2 px-3 text-slate-300 font-mono">{formatNumber(t.lastScore)}</td>
                        <td className="py-2 px-3 text-slate-500">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${t.normalized_title}-expanded`}>
                          <td colSpan={8} className="p-0">
                            <div className="bg-[#0f172a] px-6 py-3 border-b border-[#334155]/50">
                              <div className="text-[10px] text-slate-500 mb-2">امتیاز روزانه:</div>
                              <div className="flex flex-wrap gap-2">
                                {t.dailyScores.map((d) => (
                                  <div
                                    key={d.date}
                                    className="bg-[#1e293b] rounded-lg px-2 py-1 text-[10px] border border-[#334155]"
                                  >
                                    <div className="text-slate-400">{d.date}</div>
                                    <div className="text-slate-200 font-mono">
                                      {d.score != null ? formatNumber(d.score) : "-"}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
