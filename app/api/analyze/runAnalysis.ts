// app/lib/analysis/runAnalysis.ts
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
import {
  fetchKarzarTop,
  fetchNiniSiteHottest,
} from "@/app/lib/sources/webScrapers";
import { fetchWikiTopFa } from "@/app/lib/sources/wikiTop";

export type AnalysisStep =
  | "starting"
  | "fetching_sources"
  | "fusing_data"
  | "clustering"
  | "sentiment_forecast"
  | "building_prompts"
  | "generating_reports"
  | "completed"
  | "failed";

export type SourceStatus = "pending" | "running" | "done" | "error";

export type AnalysisProgressPayload = {
  progress: number;
  step: AnalysisStep;
  message: string;
  sources?: {
    google: SourceStatus;
    wiki: SourceStatus;
    ninisite: SourceStatus;
    karzar: SourceStatus;
    digikala: SourceStatus;
  };
};

export type AnalysisResult = {
  generatedAt: string;
  items: any[];
  labels: any;
  sentiment: any;
  forecast: any;
  reports: {
    generalReport: string;
    womenSocialReport: string;
    marketReport: string;
  };
  sourceBreakdown: {
    google: number;
    wiki: number;
    ninisite: number;
    karzar: number;
    digikala: number;
  };
};

type RunAnalysisOptions = {
  onProgress?: (payload: AnalysisProgressPayload) => void;
};

export async function runAnalysis(
  options?: RunAnalysisOptions
): Promise<AnalysisResult> {
  const onProgress = options?.onProgress;

  const sourceStatuses: AnalysisProgressPayload["sources"] = {
    google: "pending",
    wiki: "pending",
    ninisite: "pending",
    karzar: "pending",
    digikala: "pending",
  };

  const emit = (payload: AnalysisProgressPayload) => {
    onProgress?.(payload);
  };

  try {
    emit({
      progress: 5,
      step: "starting",
      message: "شروع تحلیل داده‌ها",
      sources: sourceStatuses,
    });

    emit({
      progress: 10,
      step: "fetching_sources",
      message: "در حال دریافت داده از منابع",
      sources: {
        ...sourceStatuses,
        google: "running",
        wiki: "running",
        ninisite: "running",
        karzar: "running",
        digikala: "running",
      },
    });

    const results = await Promise.allSettled([
      fetchGoogleTrendsIR(),
      fetchWikiTopFa(),
      fetchNiniSiteHottest(),
      fetchKarzarTop(),
      fetchDigikalaBestSelling(),
    ]);

    const [googleResult, wikiResult, ninisiteResult, karzarResult, digikalaResult] =
      results;

    const google =
      googleResult.status === "fulfilled" ? googleResult.value : [];
    const wiki = wikiResult.status === "fulfilled" ? wikiResult.value : [];
    const ninisite =
      ninisiteResult.status === "fulfilled" ? ninisiteResult.value : [];
    const karzar =
      karzarResult.status === "fulfilled" ? karzarResult.value : [];
    const digikala =
      digikalaResult.status === "fulfilled" ? digikalaResult.value : [];

    emit({
      progress: 30,
      step: "fetching_sources",
      message: "دریافت داده از منابع تکمیل شد",
      sources: {
        google: googleResult.status === "fulfilled" ? "done" : "error",
        wiki: wikiResult.status === "fulfilled" ? "done" : "error",
        ninisite: ninisiteResult.status === "fulfilled" ? "done" : "error",
        karzar: karzarResult.status === "fulfilled" ? "done" : "error",
        digikala: digikalaResult.status === "fulfilled" ? "done" : "error",
      },
    });

    emit({
      progress: 40,
      step: "fusing_data",
      message: "در حال ادغام و نرمال‌سازی داده‌ها",
    });

    const allItems = [...google, ...wiki, ...ninisite, ...karzar, ...digikala];
    const fused = normalizeAndFuse(allItems);

    emit({
      progress: 55,
      step: "clustering",
      message: "در حال خوشه‌بندی و برچسب‌گذاری موضوعات",
    });

    const clustered = clusterItems(fused);
    const clusterLabels = generateClusterLabels(clustered);

    emit({
      progress: 68,
      step: "sentiment_forecast",
      message: "در حال تحلیل احساسات و پیش‌بینی",
    });

    const sentiment = estimateSentiment(clustered);
    const forecast = forecastTomorrow(clustered);

    const ninisiteItems = fused.filter((x) => x.source === "ninisite");
    const digikalaItems = fused.filter((x) => x.source === "digikala");

    emit({
      progress: 78,
      step: "building_prompts",
      message: "در حال آماده‌سازی پرامپت‌های تحلیلی",
    });

    const generalMessages = buildGeneralAnalysisPrompt({
      items: clustered.slice(0, 40),
      sentiment,
      forecast,
      labels: clusterLabels,
    });

    const womenMessages = buildWomenSocialPrompt({
      items: ninisiteItems.slice(0, 40),
      count: ninisiteItems.length,
    });

    const marketMessages = buildDigikalaMarketPrompt({
      items: digikalaItems.slice(0, 40),
      count: digikalaItems.length,
    });

    emit({
      progress: 90,
      step: "generating_reports",
      message: "در حال تولید گزارش‌های نهایی با مدل زبانی",
    });

    const [generalLLM, womenLLM, marketLLM] = await Promise.all([
      callOpenRouter(generalMessages),
      callOpenRouter(womenMessages),
      callOpenRouter(marketMessages),
    ]);

    const generalReport =
      generalLLM?.choices?.[0]?.message?.content ?? "تحلیل کلی تولید نشد.";

    const womenSocialReport =
      womenLLM?.choices?.[0]?.message?.content ??
      "تحلیل اجتماعی زنان تولید نشد.";

    const marketReport =
      marketLLM?.choices?.[0]?.message?.content ??
      "تحلیل اقتصادی/اجتماعی بازار تولید نشد.";

    const finalResult: AnalysisResult = {
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
    };

    emit({
      progress: 100,
      step: "completed",
      message: "تحلیل با موفقیت تکمیل شد",
      sources: {
        google: googleResult.status === "fulfilled" ? "done" : "error",
        wiki: wikiResult.status === "fulfilled" ? "done" : "error",
        ninisite: ninisiteResult.status === "fulfilled" ? "done" : "error",
        karzar: karzarResult.status === "fulfilled" ? "done" : "error",
        digikala: digikalaResult.status === "fulfilled" ? "done" : "error",
      },
    });

    return finalResult;
  } catch (error) {
    emit({
      progress: 100,
      step: "failed",
      message: "خطا در تحلیل داده‌ها",
    });

    throw error;
  }
}
