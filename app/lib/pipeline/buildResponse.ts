import { NextResponse } from "next/server";
import {
  AnalyzeResponse,
  ClusteredItem,
  ClusterLabels,
  ForecastResult,
  SafeResult,
  SentimentResult,
  SourceBreakdown,
  SourceErrors,
  SourceName,
  SourceStatusMap,
  RawTrendItem,
} from "../types";

export function buildAnalyzeResponse(params: {
  clustered: ClusteredItem[];
  labels: ClusterLabels;
  sentiment: SentimentResult;
  forecast: ForecastResult;
  reports: { generalReport: string; womenSocialReport: string; marketReport: string };
  sourceResults: Map<SourceName, SafeResult<RawTrendItem[]>>;
  sourceCounts: SourceBreakdown;
  reportWarnings?: string[];
}): AnalyzeResponse {
  return {
    generatedAt: new Date().toISOString(),
    items: params.clustered,
    labels: params.labels,
    sentiment: params.sentiment,
    forecast: params.forecast,
    reports: params.reports,
    sourceBreakdown: params.sourceCounts,
    status: buildStatusMap(params.sourceResults),
    errors: buildErrorMap(params.sourceResults),
  };
}

function buildStatusMap(results: Map<SourceName, SafeResult<RawTrendItem[]>>): SourceStatusMap {
  const entries = Array.from(results.entries());
  return Object.fromEntries(entries.map(([k, v]) => [k, v.status])) as SourceStatusMap;
}

function buildErrorMap(results: Map<SourceName, SafeResult<RawTrendItem[]>>): SourceErrors {
  const entries = Array.from(results.entries());
  return Object.fromEntries(entries.map(([k, v]) => [k, v.error ?? null])) as SourceErrors;
}

export function buildSourceCounts(
  results: Map<SourceName, SafeResult<RawTrendItem[]>>
): SourceBreakdown {
  const counts: Record<string, number> = {};
  for (const [name, result] of results) {
    counts[name] = Array.isArray(result.data) ? result.data.length : 0;
  }
  return counts as SourceBreakdown;
}

export function buildErrorResponse(message: string, status: number = 503) {
  const response = NextResponse.json({ error: "no_data_available", message }, { status });
  if (status === 503) {
    response.headers.set("Retry-After", "60");
  }
  return response;
}

export function buildSuccessResponse(data: AnalyzeResponse) {
  const response = NextResponse.json(data, { status: 200 });
  response.headers.set(
    "Cache-Control",
    "public, max-age=600, s-maxage=86400, stale-while-revalidate=1200"
  );
  response.headers.set("CDN-Cache-Control", "public, s-maxage=3600");
  response.headers.set("x-nextjs-cache", "HIT");
  return response;
}
