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



export type SourceName = "google" | "wiki" | "ninisite" | "karzar" | "digikala";





