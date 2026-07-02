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
        <div className="bg-white border rounded-xl p-6 text-center text-gray-500">
          خطا در دریافت تحلیل. لطفاً دوباره تلاش کنید.
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
   <header className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">🔥 داشبورد AI ترندها</h1>
        <span className="text-xs text-gray-500">
          بروزرسانی: {new Date(data.generatedAt).toLocaleString("fa-IR")}
        </span>
      </header>

      <StatCards
        fear={data.sentiment.fear}
        excitement={data.sentiment.excitement}
        crisis={data.sentiment.crisis}
        sexualSignal={data.sentiment.sexualSignal}
        polarity={data.sentiment.polarity}
        politicalTension={data.sentiment.politicalTension}
      />

      <AnalysisPanel
        generalReport={data.reports.generalReport}
        womenSocialReport={data.reports.womenSocialReport}
        marketReport={data.reports.marketReport}
      />

      {/* <TrendsTable items={data.items} labels={data.labels} /> */}
    </main>
  );
}
