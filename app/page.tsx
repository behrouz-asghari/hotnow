import { headers } from "next/headers";
import AnalysisPanel from "./components/AnalysisPanel";
import StatCards from "./components/StatCards";
import { AnalyzeResponse } from "./lib/types";
import RefreshButton from "./components/RefreshButton";
import TrendsLabelsBoard from "./components/TrendsLabelsBoard";


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
    items: Array.isArray(data.items) ? (data.items as any) : [],
    sentiment: {
      fear: data.sentiment?.fear ?? 0,
      excitement: data.sentiment?.excitement ?? 0,
      crisis: data.sentiment?.crisis ?? 0,
      sexualSignal: data.sentiment?.sexualSignal ?? 0,
      politicalTension: data.sentiment?.politicalTension ?? 0,
      polarity: data.sentiment?.polarity ?? 0,
    },
    forecast: {
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
  };
}

export default async function Page() {
  const data = await getAnalysis();

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">

      <header className="flex items-center justify-between gap-4">
        <div className="flex flex-row justify-between items-center gap-4 w-full">
          <h1 className="text-2xl font-extrabold">🔥 داشبورد AI ترندها</h1>
          <div className="flex flex-col items-start gap-2">
           <span className="text-xs text-gray-500 block mt-1">
            {data.generatedAt
              ? `بروزرسانی: ${new Date(data.generatedAt).toLocaleString("fa-IR")}`
              : "زمان نامشخص"}
          </span>
             <RefreshButton />
          </div>

        </div>

      </header>


      <StatCards
        fear={data.sentiment?.fear ?? 0}
        excitement={data.sentiment?.excitement ?? 0}
        crisis={data.sentiment?.crisis ?? 0}
        sexualSignal={data.sentiment?.sexualSignal ?? 0}
        polarity={data.sentiment?.polarity ?? 0}
        politicalTension={data.sentiment?.politicalTension ?? 0}
      />
      <TrendsLabelsBoard items={data?.items} />

      <AnalysisPanel
        generalReport={data.reports?.generalReport || "تحلیلی دریافت نشد."}
        womenSocialReport={data.reports?.womenSocialReport || "داده‌های اجتماعی در دسترس نیست."}
        marketReport={data.reports?.marketReport || "داده‌های بازار در دسترس نیست."}
      />

    </main>
  );
}
