import { NextResponse } from "next/server";
import { clusterItems } from "@/app/lib/ai/clustering";
import { estimateSentiment } from "@/app/lib/ai/sentiment";
import { forecastTomorrow } from "@/app/lib/ai/forecast";
import { generateClusterLabels } from "@/app/lib/ai/labels";
import { callOpenRouter } from "@/app/lib/ai/openrouter";
import { normalizeAndFuse } from "@/app/lib/fusion/mergeSignals";
import { fetchDigikalaBestSelling } from "@/app/lib/sources/digikala";
import { RawTrendItem, SafeResult, SourceName } from "@/app/lib/types";
import { fetchGoogleTrendsIR } from "@/app/lib/sources/googleTrends";
import { fetchWikiTopFa } from "@/app/lib/sources/wikiTop";
import {
  buildGeneralAnalysisPrompt,
  buildWomenSocialPrompt,
  buildDigikalaMarketPrompt,
} from "@/app/lib/ai/prompts";
import {
  fetchNiniSiteHottest,
  fetchKarzarTop,
  fetchTgStatTrends,
} from "@/app/lib/sources/webScrapers";


// ===== Utils =====
function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  name: string
): Promise<T> {
  let timer: NodeJS.Timeout | null = null;

  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(`[${name}] timeout after ${ms}ms`);
      (err as any).code = "TIMEOUT";
      reject(err);
    }, ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

async function safeSource<T>(
  name: SourceName,
  fn: () => Promise<T>,
  fallback: T,
  timeoutMs = 7000
): Promise<SafeResult<T>> {
  try {
    const data = await withTimeout(fn(), timeoutMs, name);
    const isEmptyArray = Array.isArray(data) && data.length === 0;

    return {
      ok: true,
      data,
      status: isEmptyArray ? "empty" : "online",
    };
  } catch (e: any) {
    const msg = e?.message || "unknown_error";
    const isTimeout = e?.code === "TIMEOUT" || /timeout/i.test(msg);

    console.error(`[${name}] failed:`, e);

    return {
      ok: false,
      data: fallback,
      error: msg,
      status: isTimeout ? "timeout" : "error",
    };
  }
}

function asArray(input: unknown): RawTrendItem[] {
  return Array.isArray(input) ? (input as RawTrendItem[]) : [];
}

function sanitizeItems(
  items: RawTrendItem[],
  source: SourceName
): RawTrendItem[] {
  return items
    .filter(
      (x) =>
        x &&
        typeof x.title === "string" &&
        x.title.trim().length > 0
    )
    .map((x) => ({
      ...x,
      source: x.source ?? source,
      title: x.title.trim(),
      score: typeof x.score === "number" && Number.isFinite(x.score) ? x.score : 0,
      timestamp:
        typeof x.timestamp === "number" && Number.isFinite(x.timestamp)
          ? x.timestamp
          : Date.now(),
    }));
}

// ===== Route =====
export async function GET() {
  try {
    // 1) Fetch all sources safely in parallel
    const [googleR, wikiR, ninisiteR, karzarR, tgstatR, digikalaR] =
      await Promise.all([
        safeSource("google", fetchGoogleTrendsIR, [] as RawTrendItem[], 6000),
        safeSource("wiki", fetchWikiTopFa, [] as RawTrendItem[], 6000),
        safeSource("ninisite", fetchNiniSiteHottest, [] as RawTrendItem[], 7000),
        safeSource("karzar", fetchKarzarTop, [] as RawTrendItem[], 7000),
        safeSource("tgstat", fetchTgStatTrends, [] as RawTrendItem[], 8000),
        safeSource("digikala", fetchDigikalaBestSelling, [] as RawTrendItem[], 5000),
      ]);

    const google = sanitizeItems(asArray(googleR.data), "google");
    const wiki = sanitizeItems(asArray(wikiR.data), "wiki");
    const ninisite = sanitizeItems(asArray(ninisiteR.data), "ninisite");
    const karzar = sanitizeItems(asArray(karzarR.data), "karzar");
    const tgstat = sanitizeItems(asArray(tgstatR.data), "tgstat");
    const digikala = sanitizeItems(asArray(digikalaR.data), "digikala");

    const allItems = [
      ...google,
      ...wiki,
      ...ninisite,
      ...karzar,
      ...tgstat,
      ...digikala,
    ];

    // 2) If all sources failed or returned empty
    if (allItems.length === 0) {
      return NextResponse.json(
        {
          error: "no_data_available",
          message: "فعلاً از هیچ منبعی داده دریافت نشد.",
          generatedAt: new Date().toISOString(),
          items: [],
          labels: {},
          sentiment: {
            fear: 0,
            excitement: 0,
            crisis: 0,
            sexualSignal: 0,
            politicalTension: 0,
            polarity: 0,
          },
          forecast: {
            direction: "flat",
            confidence: 0,
          },
          reports: {
            generalReport: "در حال حاضر داده کافی برای تحلیل کلی موجود نیست.",
            womenSocialReport:
              "داده کافی از نی‌نی‌سایت برای تحلیل اجتماعی زنان موجود نیست.",
            marketReport: "داده کافی از دیجی‌کالا برای تحلیل بازار موجود نیست.",
          },
          sourceBreakdown: {
            google: google.length,
            wiki: wiki.length,
            ninisite: ninisite.length,
            karzar: karzar.length,
            tgstat: tgstat.length,
            digikala: digikala.length,
          },
          status: {
            google: googleR.status,
            wiki: wikiR.status,
            ninisite: ninisiteR.status,
            karzar: karzarR.status,
            tgstat: tgstatR.status,
            digikala: digikalaR.status,
          },
          errors: {
            google: googleR.error ?? null,
            wiki: wikiR.error ?? null,
            ninisite: ninisiteR.error ?? null,
            karzar: karzarR.error ?? null,
            tgstat: tgstatR.error ?? null,
            digikala: digikalaR.error ?? null,
          },
        },
        { status: 503 }
      );
    }

    // 3) Analysis pipeline
    const fused = normalizeAndFuse(allItems);
    const clustered = clusterItems(fused);
    const labels = generateClusterLabels(clustered);
    const sentiment = estimateSentiment(clustered);
    const forecast = forecastTomorrow(clustered);

    const ninisiteItems = fused.filter((x: RawTrendItem) => x.source === "ninisite");
    const digikalaItems = fused.filter((x: RawTrendItem) => x.source === "digikala");

    // 4) Build prompts
    const generalMessages = buildGeneralAnalysisPrompt({
      items: clustered.slice(0, 40),
      sentiment,
      forecast,
      labels,
    });

    // 5) LLM calls safely
    const [generalLLM, womenLLM, marketLLM] = await Promise.all([
      callOpenRouter(generalMessages).catch((e) => {
        console.error("[LLM][general] failed:", e);
        return null;
      }),
      ninisiteItems.length > 0
        ? callOpenRouter(
            buildWomenSocialPrompt({
              items: ninisiteItems.slice(0, 40),
              count: ninisiteItems.length,
            })
          ).catch((e) => {
            console.error("[LLM][women] failed:", e);
            return null;
          })
        : Promise.resolve(null),
      digikalaItems.length > 0
        ? callOpenRouter(
            buildDigikalaMarketPrompt({
              items: digikalaItems.slice(0, 40),
              count: digikalaItems.length,
            })
          ).catch((e) => {
            console.error("[LLM][market] failed:", e);
            return null;
          })
        : Promise.resolve(null),
    ]);

    const generalReport =
      generalLLM?.choices?.[0]?.message?.content?.trim() ||
      "تحلیل کلی با داده‌های موجود تولید نشد.";

    const womenSocialReport =
      ninisiteItems.length === 0
        ? "داده‌ای از نی‌نی‌سایت دریافت نشد؛ تحلیل اجتماعی زنان میسر نیست."
        : womenLLM?.choices?.[0]?.message?.content?.trim() ||
          "تحلیل اجتماعی زنان در حال حاضر تولید نشد.";

    const marketReport =
      digikalaItems.length === 0
        ? "داده‌ای از دیجی‌کالا دریافت نشد؛ تحلیل اقتصادی بازار میسر نیست."
        : marketLLM?.choices?.[0]?.message?.content?.trim() ||
          "تحلیل بازار در حال حاضر تولید نشد.";

    // 6) Success response
       // 6) Success response
    const responseData = {
      generatedAt: new Date().toISOString(),
      items: clustered,
      labels,
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
        tgstat: tgstat.length,
        digikala: digikala.length,
      },
      status: {
        google: googleR.status,
        wiki: wikiR.status,
        ninisite: ninisiteR.status,
        karzar: karzarR.status,
        tgstat: tgstatR.status,
        digikala: digikalaR.status,
      },
      errors: {
        google: googleR.error ?? null,
        wiki: wikiR.error ?? null,
        ninisite: ninisiteR.error ?? null,
        karzar: karzarR.error ?? null,
        tgstat: tgstatR.error ?? null,
        digikala: digikalaR.error ?? null,
      },
    };

    // ساخت شیء پاسخ
    const response = NextResponse.json(responseData, { status: 200 });

    response.headers.set(
      "Cache-Control",
      "public, max-age=600, s-maxage=86400, stale-while-revalidate=1200"
    );

    response.headers.set("CDN-Cache-Control", "public, s-maxage=3600");
    response.headers.set("x-nextjs-cache", "HIT");

    return response;

  } catch (e) {
    console.error("Critical Analysis Error:", e);

    return NextResponse.json(
      {
        error: "analysis_failed",
        message: "خطای بحرانی در زیرساخت تحلیل.",
      },
      { status: 500 }
    );
  }
}
