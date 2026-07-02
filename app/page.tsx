import { headers } from "next/headers";
import AnalysisPanel from "./components/AnalysisPanel";
import StatCards from "./components/StatCards";
import { AnalyzeResponse } from "./lib/types";




async function getAnalysis(): Promise<AnalyzeResponse | null> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "https";

    if (!host) return null;

    const baseUrl = `${proto}://${host}`;
    const res = await fetch(`${baseUrl}/api/analyze`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = (await res.json()) as Partial<AnalyzeResponse>;

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
  } catch (e) {
    console.error("getAnalysis failed:", e);
    return null;
  }
}
export default async function Page() {
  const data = await getAnalysis();
 console.log("Fetched analysis data:", data);

if (!data) {
    return (
      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-10 text-center text-red-600">
          <p className="font-bold">⚠️ سرویس موقتاً در دسترس نیست</p>
          <p className="text-sm mt-2">قادر به دریافت تحلیل از سرور نیستیم. لطفاً دقایقی دیگر تلاش کنید.</p>
        </div>
      </main>
    );
  }
  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
   <header className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">🔥 داشبورد AI ترندها</h1>
           <span className="text-xs text-gray-500">
          {data.generatedAt
            ? `بروزرسانی: ${new Date(data.generatedAt).toLocaleString("fa-IR")}`
            : "زمان نامشخص"}
        </span>
      </header>

        <StatCards
        fear={data.sentiment?.fear ?? 0}
        excitement={data.sentiment?.excitement ?? 0}
        crisis={data.sentiment?.crisis ?? 0}
        sexualSignal={data.sentiment?.sexualSignal ?? 0}
        polarity={data.sentiment?.polarity ?? 0}
        politicalTension={data.sentiment?.politicalTension ?? 0}
      />

      <AnalysisPanel
        generalReport={data.reports?.generalReport || "تحلیلی دریافت نشد."}
        womenSocialReport={data.reports?.womenSocialReport || "داده‌های اجتماعی در دسترس نیست."}
        marketReport={data.reports?.marketReport || "داده‌های بازار در دسترس نیست."}
      />

      {/* <TrendsTable items={data.items} labels={data.labels} /> */}
    </main>
  );
}
