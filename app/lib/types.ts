// ── Source Configuration ──
export const SOURCE_NAMES = [
  "google", "wiki", "ninisite", "karzar", "digikala", "tgstat", "filimo",
] as const;

export type SourceName = (typeof SOURCE_NAMES)[number];

export type SourceStatus = "online" | "empty" | "error" | "timeout";

// ── Raw Items ──
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

// ── Pipeline Items ──
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

// ── Analysis Results ──
export interface SentimentResult {
  fear: number;
  excitement: number;
  crisis: number;
  polarity: number;
  sexualSignal: number;
  politicalTension: number;
}

export interface ForecastResult {
  nextDayScore: number;
  confidence: number;
  direction: "up" | "flat" | "down";
}

export type ClusterLabels = Record<number, string>;

// ── Source Fetcher Result ──
export type SafeResult<T> = {
  ok: boolean;
  data: T;
  error?: string;
  status: SourceStatus;
};

// ── API Response Types ──
export type SourceBreakdown = Record<SourceName, number>;

export type SourceStatusMap = Record<SourceName, SourceStatus>;

export type SourceErrors = Record<SourceName, string | null>;

export interface AnalyzeResponse {
  generatedAt: string;
  items: ClusteredItem[];
  sentiment: SentimentResult;
  forecast: ForecastResult;
  labels: ClusterLabels;
  reports: {
    generalReport: string;
    womenSocialReport: string;
    marketReport: string;
  };
  sourceBreakdown: SourceBreakdown;
  status: SourceStatusMap;
  errors: SourceErrors;
}

// ── Job System Types ──
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
  data: AnalyzeResponse | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
  sources?: Partial<SourceStatusMap>;
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
