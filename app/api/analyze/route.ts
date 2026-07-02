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

export async function GET() {
  try {
    const results = await Promise.allSettled([
      fetchGoogleTrendsIR(),
      fetchWikiTopFa(),
      fetchNiniSiteHottest(),
      fetchKarzarTop(),
      fetchDigikalaBestSelling(),
    ]);

    const [google, wiki, ninisite, karzar, digikala] = results.map((r) =>
      r.status === "fulfilled" ? r.value : []
    );

    const allItems = [...google, ...wiki, ...ninisite, ...karzar, ...digikala];
    const fused = normalizeAndFuse(allItems);

    const clustered = clusterItems(fused);
    const clusterLabels = generateClusterLabels(clustered);
    const sentiment = estimateSentiment(clustered);
    const forecast = forecastTomorrow(clustered);

    const ninisiteItems = fused.filter((x) => x.source === "ninisite");
    const digikalaItems = fused.filter((x) => x.source === "digikala");

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

    const [generalLLM, womenLLM, marketLLM] = await Promise.all([
      callOpenRouter(generalMessages),
      callOpenRouter(womenMessages),
      callOpenRouter(marketMessages),
    ]);

    const generalReport =
      generalLLM?.choices?.[0]?.message?.content ?? "تحلیل کلی تولید نشد.";

    const womenSocialReport =
      womenLLM?.choices?.[0]?.message?.content ?? "تحلیل اجتماعی زنان تولید نشد.";

    const marketReport =
      marketLLM?.choices?.[0]?.message?.content ?? "تحلیل اقتصادی/اجتماعی بازار تولید نشد.";

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
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: "analysis_failed",
        message: `خطا در تحلیل داده‌ها: ${String(e)}`,
      },
      { status: 500 }
    );
  }
}
