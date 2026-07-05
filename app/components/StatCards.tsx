"use client";

import { motion } from "framer-motion";
import { Brain, Zap, AlertTriangle, Compass, TrendingUp, Magnet } from "lucide-react";
import type { SentimentResult } from "@/app/lib/types";

type MetricConfig = {
  key: keyof SentimentResult;
  label: string;
  icon: React.ElementType;
  color: string;
  glowColor: string;
};

const METRICS: MetricConfig[] = [
  { key: "fear", label: "ترس", icon: Brain, color: "#f43f5e", glowColor: "rgba(244,63,94,0.3)" },
  { key: "excitement", label: "هیجان", icon: Zap, color: "#f59e0b", glowColor: "rgba(245,158,11,0.3)" },
  { key: "crisis", label: "بحران", icon: AlertTriangle, color: "#ef4444", glowColor: "rgba(239,68,68,0.3)" },
  { key: "sexualSignal", label: "سیگنال جنسی", icon: Compass, color: "#8b5cf6", glowColor: "rgba(139,92,246,0.3)" },
  { key: "politicalTension", label: "تنش سیاسی", icon: TrendingUp, color: "#3b82f6", glowColor: "rgba(59,130,246,0.3)" },
  { key: "polarity", label: "حس جامعه", icon: Magnet, color: "#06b6d4", glowColor: "rgba(6,182,212,0.3)" },
];

function CircularGauge({ value, color, glowColor }: { value: number; color: string; glowColor: string }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value * circumference);

  return (
    <div className="relative w-16 h-16">
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#334155" strokeWidth="4" />
        <motion.circle
          cx="32" cy="32" r={radius} fill="none"
          stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-100">
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}

export default function StatCards(props: SentimentResult) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {METRICS.map((m, i) => (
        <motion.div
          key={m.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4 glow-card flex flex-col items-center gap-3"
        >
          <m.icon className="w-5 h-5" style={{ color: m.color }} />
          <CircularGauge value={props[m.key] ?? 0} color={m.color} glowColor={m.glowColor} />
          <span className="text-xs text-slate-400 font-medium text-center">{m.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
