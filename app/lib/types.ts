export type SourceType = "google" | "wiki";


export interface NormalizedItem extends RawTrendItem {
  id: string;
  cleanTitle: string;
  tokens: string[];
  weight: number;
}

export interface ClusteredItem extends NormalizedItem {
  clusterId: number;
  clusterLabel?: string;
}

export type SentimentResult = {
  fear: number;
  excitement: number;
  crisis: number;
  polarity: number;
  sexualSignal: number;
  politicalTension: number;
};


export interface ForecastResult {
  nextDayScore: number;
  confidence: number; // 0..1
  direction: "up" | "flat" | "down";
}

export interface AnalysisOutput {
  generatedAt: string;
  items: ClusteredItem[];
  clusters: Array<{ id: number; label: string; size: number; score: number }>;
  sentiment: SentimentResult;
  forecast: ForecastResult;
  persianReport: string;
}

export type SourceStatus = "online" | "empty" | "error" | "timeout";


export type SourceName =
  | "google"
  | "wiki"
  | "ninisite"
  | "karzar"
  | "digikala"
  | "tgstat"
  | "filimo";

export interface TrendDetail {
  key: string;
  value: string | number | boolean | null;
}

export interface RawTrendItem {
  title: string;
  source: SourceName;
  timestamp?: string | number;
  traffic?: number;
  views?: number;
  score?: number;
  details?: TrendDetail[];
  url?: string;
  image?: string;

}

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
    digikala: number;
  };
};

export type AnalysisJobResponse = {
  id: string;
  status: "queued" | "running" | "done" | "error";
  progress: number;
  step:
  | "starting"
  | "fetching_sources"
  | "fusing_data"
  | "clustering"
  | "sentiment_forecast"
  | "building_prompts"
  | "generating_reports"
  | "completed"
  | "failed";
  message: string;
  data: AnalysisResult | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
  sources?: {
    google: SourceStatus;
    wiki: SourceStatus;
    ninisite: SourceStatus;
    digikala: SourceStatus;
  };
};

export const stepLabels: Record<AnalysisJobResponse["step"], string> = {
  starting: "شروع تحلیل",
  fetching_sources: "دریافت داده از منابع",
  fusing_data: "ادغام و نرمال‌سازی",
  clustering: "خوشه‌بندی و برچسب‌گذاری",
  sentiment_forecast: "تحلیل احساسات و پیش‌بینی",
  building_prompts: "آماده‌سازی پرامپت‌ها",
  generating_reports: "تولید گزارش نهایی",
  completed: "تکمیل شد",
  failed: "خطا",
};

export type SafeResult<T> = {
  ok: boolean;
  data: T;
  error?: string;
  status: SourceStatus;
};

export type Item = {
  id: string;
  title: string;
  source: SourceName;
  clusterId: number;
  weight: number;
};

export type AnalyzeResponse = {
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