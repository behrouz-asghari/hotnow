import { NextResponse } from "next/server";
import { clusterItems } from "@/app/lib/ai/clustering";
import { estimateSentiment } from "@/app/lib/ai/sentiment";
import { forecastTomorrow } from "@/app/lib/ai/forecast";
import { generateClusterLabels } from "@/app/lib/ai/labels";
import { normalizeAndFuse } from "@/app/lib/fusion/mergeSignals";
import { RawTrendItem } from "@/app/lib/types";
import { fetchAllSources } from "@/app/lib/pipeline/fetchSources";
import { sanitizeItems } from "@/app/lib/pipeline/sanitize";
import { generateReports } from "@/app/lib/pipeline/llmReports";
import {
  buildAnalyzeResponse,
  buildErrorResponse,
  buildSourceCounts,
  buildSuccessResponse,
} from "@/app/lib/pipeline/buildResponse";

export async function GET() {
  try {
    // 1) Fetch all sources in parallel
    const { results: sourceResults } = await fetchAllSources();

    // 2) Sanitize per source
    const sanitized = Array.from(sourceResults.entries()).flatMap(([name, result]) =>
      sanitizeItems(result.data ?? [], name)
    );

    // 3) Empty check
    if (sanitized.length === 0) {
      return buildErrorResponse("فعلاً از هیچ منبعی داده دریافت نشد.");
    }

    // 4) Analysis pipeline
    const fused = normalizeAndFuse(sanitized);
    const clustered = clusterItems(fused);
    const labels = generateClusterLabels(clustered);
    const sentiment = estimateSentiment(clustered);
    const forecast = forecastTomorrow(clustered);

    // 5) Generate LLM reports
    const ninisiteItems = fused.filter((x: RawTrendItem) => x.source === "ninisite");
    const digikalaItems = fused.filter((x: RawTrendItem) => x.source === "digikala");

    const reports = await generateReports(
      clustered, sentiment, forecast, labels, ninisiteItems, digikalaItems
    );

    // 6) Build response
    const data = buildAnalyzeResponse({
      clustered, labels, sentiment, forecast,
      reports: { generalReport: reports.generalReport, womenSocialReport: reports.womenSocialReport, marketReport: reports.marketReport },
      sourceResults, sourceCounts: buildSourceCounts(sourceResults),
      reportWarnings: reports.reportWarnings,
    });

    return buildSuccessResponse(data);
  } catch (e) {
    console.error("Critical Analysis Error:", e);
    return NextResponse.json(
      { error: "analysis_failed", message: "خطای بحرانی در زیرساخت تحلیل." },
      { status: 500 }
    );
  }
}
