"use client";

import { motion } from "framer-motion";
import type { ClusteredItem, TrendDetail, SourceName } from "@/app/lib/types";
import PersianSwear from "persian-swear-words";

type Props = {
  items?: ClusteredItem[];
};

const sourceSections: Array<{
  key: SourceName;
  title: string;
  chipClass: string;
}> = [
  {
    key: "google",
    title: "۱۰ مورد گوگل ترندز",
    chipClass: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  },
  {
    key: "wiki",
    title: "۱۰ مورد ویکی‌پدیا",
    chipClass: "bg-slate-500/10 text-slate-300 border-slate-500/20",
  },
  {
    key: "filimo",
    title: "۱۰ فیلم و سریال برتر فیلیمو",
    chipClass: "bg-orange-500/10 text-orange-300 border-orange-500/20",
  },
  {
    key: "digikala",
    title: "۱۰ محصول دیجی‌کالا",
    chipClass: "bg-red-500/10 text-red-300 border-red-500/20",
  },
  {
    key: "ninisite",
    title: "۱۰ تاپیک نی‌نی‌سایت",
    chipClass: "bg-pink-500/10 text-pink-300 border-pink-500/20",
  },
  {
    key: "tgstat",
    title: "۱۰ پست برتر تلگرام",
    chipClass: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  },
  {
    key: "karzar",
    title: "۱۰ کمپین کارزار",
    chipClass: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  },
];

// Multi-word sexual phrases and implicit terms that persian-swear-words won't catch
const SEXUAL_PHRASES = [
  // Sexual positions
  "زن در بالا", "مرد در پایین", "پوزیشن زن بالا", "پوزیشن مرد پایین",
  "سوارکاری", "دگسی", "میشنری", "داگی استایل", "پوزیشن ۶۹",
  // Sexual acts / contexts
  "پوزیشن‌های جنسی", "پوزیشن های جنسی", "روش های آمیزش", "روش‌های آمیزش",
  "آمیزش جنسی", "کنش جنسی", "کنش‌های جنسی", "نزدیکی جنسی",
  "تماس جنسی", "رابطه جنسی", "ارتباط جنسی",
  // Sexual content descriptors
  "فیلم سکسی", "صحنه سکسی", "ویدیو سکسی", "فیلم پورنو",
  "فیلم بزرگسال", "صحنه برهنه", "ویدیو برهنه",
  // Contextual body references
  "سینه زن", "باسن زن", "آلت مرد", "آلت مردانه",
];

const phraseRegex = new RegExp(
  SEXUAL_PHRASES.map((kw) => kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
  "gi"
);

function isSexualContent(text: string): boolean {
  if (!text) return false;
  // Check persian-swear-words for single swear words
  if (PersianSwear.hasSwear(text)) return true;
  // Check custom multi-word phrases
  return phraseRegex.test(text);
}

export default function TrendsLabelsBoard({ items = [] }: Props) {
  const getTopBySource = (source: SourceName): ClusteredItem[] => {
    return items
      .filter((it) => it.source === source && it.title?.trim().length > 0)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 10);
  };

  const getDetailValue = (it: ClusteredItem, key: string): string | number | null => {
    if (!it.details || !Array.isArray(it.details)) return null;
    const found = it.details.find((d: TrendDetail) => d.key === key);
    return found ? (found.value as string | number) : null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="bg-[#1e293b]/70 backdrop-blur-sm border border-[#334155] rounded-2xl p-4 space-y-5"
    >
      {sourceSections.map((section, idx) => {
        const topItems = getTopBySource(section.key);

        return (
          <motion.section
            key={section.key}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + idx * 0.05 }}
            className="space-y-2"
          >
            <h3 className="text-sm font-semibold text-slate-200">{section.title}</h3>

            {topItems.length === 0 ? (
              <p className="text-xs text-slate-500">موردی برای نمایش وجود ندارد.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {topItems.map((it) => {
                  if (it.source === "filimo") {
                    const genre = getDetailValue(it, "genre");
                    const director = getDetailValue(it, "director");
                    const year = getDetailValue(it, "year");
                    const description = getDetailValue(it, "description");

                    const metaParts = [
                      year ? `(${year})` : null,
                      director ? `اثر ${director}` : null,
                      genre ? `[${genre}]` : null,
                    ].filter(Boolean);

                    const chipLabel = metaParts.length > 0
                      ? `${it.title} ${metaParts.join(" | ")}`
                      : it.title;

                    const tooltipParts = [
                      `عنوان: ${it.title}`,
                      year ? `سال ساخت: ${year}` : null,
                      director ? `کارگردان: ${director}` : null,
                      genre ? `ژانر: ${genre}` : null,
                      description ? `\nتوضیحات:\n${description}` : null,
                    ].filter(Boolean);

                    const tooltipText = tooltipParts.join("\n");

                    const blurred = isSexualContent(chipLabel);

                    return (
                      <span
                        key={it.id}
                        title={tooltipText}
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium cursor-help transition-all hover:scale-105 ${section.chipClass} ${blurred ? "blur-sm hover:blur-none" : ""}`}
                      >
                        {chipLabel}
                      </span>
                    );
                  }

                  const blurred = isSexualContent(it.title);

                  return (
                    <span
                      key={it.id}
                      title={it.title}
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-all hover:scale-105 ${section.chipClass} ${blurred ? "blur-sm hover:blur-none" : ""}`}
                    >
                      {it.title}
                    </span>
                  );
                })}
              </div>
            )}
          </motion.section>
        );
      })}
    </motion.div>
  );
}
