"use client";

import { motion } from "framer-motion";
import { Brain, BarChart3, Users, ShoppingCart } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  generalReport: string;
  womenSocialReport: string;
  marketReport: string;
};

const EMPTY_MARKERS = [
  "داده‌ای از", "دریافت نشد", "موجود نیست", "تولید نشد", "میسر نیست",
];

function isReportEmpty(content: string): boolean {
  if (!content) return true;
  return EMPTY_MARKERS.some((marker) => content.includes(marker));
}

const SECTIONS = [
  { key: "general", title: "تحلیل کلی ترندها", icon: BarChart3 },
  { key: "women", title: "تحلیل اجتماعی زنان", icon: Users },
  { key: "market", title: "تحلیل اقتصادی و رفتار بازار", icon: ShoppingCart },
] as const;

function ReportSection({ title, content, icon: Icon }: { title: string; content: string; icon: React.ElementType }) {
  const empty = isReportEmpty(content);
  return (
    <section className={`rounded-xl border p-5 transition-all duration-300 ${
      empty
        ? "bg-[#1e293b]/50 border-[#334155] opacity-60"
        : "bg-[#1e293b] border-[#334155] hover:border-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]"
    }`}>
      <h3 className="text-base font-bold mb-3 text-slate-100 flex items-center gap-2">
        <Icon className="w-4 h-4 text-blue-400" />
        {title}
        {empty && (
          <span className="text-[10px] bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">
            دیتای منبع موجود نیست
          </span>
        )}
      </h3>
      <div className="text-sm leading-8 text-slate-300 prose prose-invert prose-sm max-w-none
        prose-headings:text-slate-100 prose-headings:font-bold prose-headings:mt-6 prose-headings:mb-3
        prose-h2:text-lg prose-h3:text-base
        prose-p:text-slate-300 prose-p:leading-8 prose-p:my-2
        prose-strong:text-slate-100 prose-strong:font-bold
        prose-table:border-collapse prose-table:w-full prose-table:my-4
        prose-th:border prose-th:border-slate-600 prose-th:bg-slate-800/50 prose-th:px-3 prose-th:py-2 prose-th:text-slate-200 prose-th:text-xs prose-th:font-semibold prose-th:text-right
        prose-td:border prose-td:border-slate-600 prose-td:px-3 prose-td:py-2 prose-td:text-xs
        prose-tr:nth-odd:prose-td:bg-slate-800/20
        prose-li:text-slate-300 prose-li:my-1
        prose-hr:border-slate-600 prose-hr:my-6
        prose-em:text-slate-400">
        {content ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        ) : (
          <p>در حال حاضر تحلیلی برای این بخش تولید نشده است.</p>
        )}
      </div>
    </section>
  );
}

export default function AnalysisPanel({ generalReport, womenSocialReport, marketReport }: Props) {
  const reports = [
    { title: SECTIONS[0].title, content: generalReport, icon: SECTIONS[0].icon },
    { title: SECTIONS[1].title, content: womenSocialReport, icon: SECTIONS[1].icon },
    { title: SECTIONS[2].title, content: marketReport, icon: SECTIONS[2].icon },
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="bg-[#1e293b]/70 backdrop-blur-sm rounded-2xl border border-[#334155] p-6 space-y-4"
    >
      <h2 className="text-lg text-slate-300 font-bold flex items-center gap-2">
        <Brain className="w-5 h-5 text-violet-400" />
        تحلیل AI
      </h2>
      {reports.map((r) => (
        <ReportSection key={r.title} {...r} />
      ))}
    </motion.section>
  );
}
