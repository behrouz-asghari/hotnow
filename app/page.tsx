import AnalysisPanel from "./components/AnalysisPanel";
import StatCards from "./components/StatCards";

type SourceName =
  | "google"
  | "wiki"
  | "ninisite"
  | "karzar"
  | "digikala";

type AnalyzeResponse = {
  generatedAt: string;
  items: Array<{
    id: string;
    title: string;
    source: SourceName;
    clusterId: number;
    weight: number;
  }>;
  sentiment: {
    fear: number;
    excitement: number;
    crisis: number;
    sexualSignal: number;
    politicalTension?: number;
    polarity?: number;
  };
  forecast: {
    direction: "up" | "flat" | "down";
    confidence: number;
  };
  labels: Record<number, string>;
  reports: {
    generalReport: string;
    womenSocialReport: string;
    marketReport: string;
  };
  sourceBreakdown?: {
    google: number;
    wiki: number;
    ninisite: number;
    karzar: number;
    digikala: number;
  };
};

async function getAnalysis(): Promise<AnalyzeResponse | null> {
  try {
    const base =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const res = await fetch(`${base}/api/analyze`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function Page() {
  const data = await getAnalysis();


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
