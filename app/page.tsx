import { headers } from "next/headers";
import { AnalyzeResponse, ClusteredItem } from "./lib/types";
import PageClient from "./components/PageClient";


async function getAnalysis(): Promise<AnalyzeResponse> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";

  if (!host) throw new Error("host_not_found");

  const baseUrl = `${proto}://${host}`;
  const res = await fetch(`${baseUrl}/api/analyze`, {
    next: { revalidate: 86400, tags: ["analyze-page"] },
  });

  if (!res.ok) throw new Error(`analyze_failed_${res.status}`);

  const data = (await res.json()) as Partial<AnalyzeResponse>;

  const hasUsableData =
    Array.isArray(data.items) && data.items.length > 0;

  if (!hasUsableData) {
    throw new Error("no_usable_data");
  }

  return {
    generatedAt: data.generatedAt ?? new Date().toISOString(),
    items: Array.isArray(data.items) ? (data.items as ClusteredItem[]) : [],
    sentiment: {
      fear: data.sentiment?.fear ?? 0,
      excitement: data.sentiment?.excitement ?? 0,
      crisis: data.sentiment?.crisis ?? 0,
      sexualSignal: data.sentiment?.sexualSignal ?? 0,
      politicalTension: data.sentiment?.politicalTension ?? 0,
      polarity: data.sentiment?.polarity ?? 0,
    },
    forecast: {
      nextDayScore: data.forecast?.nextDayScore ?? 0,
      direction: data.forecast?.direction ?? "flat",
      confidence: data.forecast?.confidence ?? 0,
    },
    labels: data.labels ?? {},
    reports: {
      generalReport: data.reports?.generalReport || "تحلیلی دریافت نشد.",
      womenSocialReport:
        data.reports?.womenSocialReport || "داده‌های اجتماعی در دسترس نیست.",
      marketReport: data.reports?.marketReport || "داده‌های بازار در دسترس نیست.",
    },
    sourceBreakdown: data.sourceBreakdown ?? {
      google: 0, wiki: 0, ninisite: 0, karzar: 0, digikala: 0, tgstat: 0, filimo: 0,
    },
    status: data.status ?? {
      google: "empty", wiki: "empty", ninisite: "empty", karzar: "empty",
      digikala: "empty", tgstat: "empty", filimo: "empty",
    },
    errors: data.errors ?? {
      google: null, wiki: null, ninisite: null, karzar: null,
      digikala: null, tgstat: null, filimo: null,
    },
  };
}

export default async function Page() {
  const data = await getAnalysis();

  return (
    <PageClient data={data} />
  );
}
