import { clusterItems } from "@/app/lib/ai/clustering";
import { forecastTomorrow } from "@/app/lib/ai/forecast";
import { generateClusterLabels } from "@/app/lib/ai/labels";
import { callOpenRouter } from "@/app/lib/ai/openrouter";
import {
  buildGeneralAnalysisPrompt,
  buildWomenSocialPrompt,
  buildDigikalaMarketPrompt,
} from "@/app/lib/ai/prompts";
import { estimateSentiment } from "@/app/lib/ai/sentiment";
import { normalizeAndFuse } from "@/app/lib/fusion/mergeSignals";
import { fetchDigikalaBestSelling } from "@/app/lib/sources/digikala";
import { fetchGoogleTrendsIR } from "@/app/lib/sources/googleTrends";
import { fetchKarzarTop, fetchNiniSiteHottest } from "@/app/lib/sources/webScrapers";
import { fetchWikiTopFa } from "@/app/lib/sources/wikiTop";
import { NextResponse } from "next/server";

// یک تابع Helper برای مدیریت Timeout و خطای اختصاصی هر منبع
async function fetchWithTimeout(promise: Promise<any>, sourceName: string, timeoutMs: number = 8000) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout: ${sourceName} response too slow`)), timeoutMs)
  );
  try {
    return await Promise.race([promise, timeoutPromise]);
  } catch (error) {
    console.error(`Error fetching ${sourceName}:`, error);
    return []; // در صورت خطا یا تایم‌اوت، آرایه خالی برمی‌گردانیم تا بقیه کار کنند
  }
}

export async function GET() {
  try {
    // مرحله 1: دریافت داده‌ها با مدیریت خطای مجزا و تایم‌اوت
    const [google, wiki, ninisite, karzar, digikala] = await Promise.all([
      fetchWithTimeout(fetchGoogleTrendsIR(), "Google Trends"),
      fetchWithTimeout(fetchWikiTopFa(), "Wikipedia"),
      fetchWithTimeout(fetchNiniSiteHottest(), "NiniSite"),
      fetchWithTimeout(fetchKarzarTop(), "Karzar"),
      fetchWithTimeout(fetchDigikalaBestSelling(), "Digikala"),
    ]);

    const allItems = [...google, ...wiki, ...ninisite, ...karzar, ...digikala];

    // اگر کلاً هیچ دیتایی از هیچ‌جا نیامد
    if (allItems.length === 0) {
       return NextResponse.json({ error: "no_data_available", message: "تمامی منابع با خطا مواجه شدند." }, { status: 503 });
    }

    const fused = normalizeAndFuse(allItems);
    const clustered = clusterItems(fused);
    const clusterLabels = generateClusterLabels(clustered);
    const sentiment = estimateSentiment(clustered);
    const forecast = forecastTomorrow(clustered);

    const ninisiteItems = fused.filter((x) => x.source === "ninisite");
    const digikalaItems = fused.filter((x) => x.source === "digikala");

    // مرحله 2: آماده‌سازی پرامپت‌ها (فقط اگر دیتا موجود باشد)
    const generalMessages = buildGeneralAnalysisPrompt({
      items: clustered.slice(0, 40),
      sentiment,
      forecast,
      labels: clusterLabels,
    });

    // مرحله 3: فراخوانی موازی LLMها با مدیریت وضعیت داده‌های خالی
    const llmTasks = [
      callOpenRouter(generalMessages),
      ninisiteItems.length > 0 ? callOpenRouter(buildWomenSocialPrompt({ items: ninisiteItems.slice(0, 40), count: ninisiteItems.length })) : Promise.resolve(null),
      digikalaItems.length > 0 ? callOpenRouter(buildDigikalaMarketPrompt({ items: digikalaItems.slice(0, 40), count: digikalaItems.length })) : Promise.resolve(null),
    ];

    const [generalLLM, womenLLM, marketLLM] = await Promise.all(llmTasks);

    // مرحله 4: استخراج گزارش‌ها با در نظر گرفتن شکست‌های احتمالی
    const generalReport = generalLLM?.choices?.[0]?.message?.content ?? "تحلیل کلی در حال حاضر مقدور نیست.";

    const womenSocialReport = ninisiteItems.length > 0
      ? (womenLLM?.choices?.[0]?.message?.content ?? "خطا در تولید تحلیل زنان.")
      : "داده‌ای از نی‌نی‌سایت دریافت نشد؛ تحلیل اجتماعی زنان میسر نیست.";

    const marketReport = digikalaItems.length > 0
      ? (marketLLM?.choices?.[0]?.message?.content ?? "خطا در تولید تحلیل بازار.")
      : "داده‌ای از دیجی‌کالا دریافت نشد؛ تحلیل اقتصادی بازار میسر نیست.";

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      items: clustered,
      labels: clusterLabels,
      sentiment,
      forecast,
      reports: {
        generalReport,
        womenSocialReport,
        marketReport,
      },
      sourceBreakdown: {
        google: google.length,
        wiki: wiki.length,
        ninisite: ninisite.length,
        karzar: karzar.length,
        digikala: digikala.length,
      },
      status: {
        digikala: digikala.length > 0 ? "online" : "blocked/error",
        ninisite: ninisite.length > 0 ? "online" : "blocked/error",
        karzar: karzar.length > 0 ? "online" : "blocked/error",
      }
    });

  } catch (e) {
    console.error("Critical Analysis Error:", e);
    return NextResponse.json(
      { error: "analysis_failed", message: "خطای بحرانی در زیرساخت تحلیل." },
      { status: 500 }
    );
  }
}
