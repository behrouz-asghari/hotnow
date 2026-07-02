import { fetchDigikalaBestSelling } from "../sources/fetchDigikalaBestSelling";
import { AnalysisProgress, AnalysisResult, RawTrendItem, RunAnalysisOptions } from "./types";


function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function emit(
  onProgress: RunAnalysisOptions["onProgress"],
  payload: AnalysisProgress
) {
  if (!onProgress) return;
  await onProgress(payload);
}

function sortItems(items: RawTrendItem[]): RawTrendItem[] {
  return [...items].sort((a, b) => b.score - a.score);
}

function takeTop(items: RawTrendItem[], limit = 10): RawTrendItem[] {
  return items.slice(0, limit);
}

function buildSummary(items: RawTrendItem[]): string {
  if (items.length === 0) {
    return "در حال حاضر داده معتبری از منابع دریافت نشد. احتمالاً برخی منابع موقتاً در دسترس نیستند یا پاسخ معتبر برنگردانده‌اند.";
  }

  const top3 = items.slice(0, 3).map((item) => item.title).join("، ");

  return `بر اساس داده‌های جمع‌آوری‌شده، ترندهای فعلی بیشتر حول این آیتم‌ها شکل گرفته‌اند: ${top3}.`;
}

export async function runAnalysis(
  options: RunAnalysisOptions = {}
): Promise<AnalysisResult> {
  const { onProgress } = options;

  await emit(onProgress, {
    step: "init",
    progress: 5,
    message: "شروع تحلیل",
  });

  await sleep(200);

  await emit(onProgress, {
    step: "fetch_digikala",
    progress: 20,
    message: "در حال دریافت داده از دیجی‌کالا",
  });

  const digikalaItems = await fetchDigikalaBestSelling();

  await emit(onProgress, {
    step: "process_data",
    progress: 55,
    message: "در حال پردازش و مرتب‌سازی داده‌ها",
  });

  await sleep(200);

  const processedItems = takeTop(sortItems(digikalaItems), 10);

  await emit(onProgress, {
    step: "llm",
    progress: 80,
    message: "در حال تولید خلاصه نهایی",
  });

  await sleep(400);

  const summary = buildSummary(processedItems);

  await emit(onProgress, {
    step: "finalize",
    progress: 95,
    message: "در حال نهایی‌سازی خروجی",
  });

  await sleep(150);

  return {
    generatedAt: Date.now(),
    summary,
    items: processedItems,
  };
}
