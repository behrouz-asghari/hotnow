export type AnalysisStep =
  | "init"
  | "fetch_digikala"
  | "process_data"
  | "llm"
  | "finalize"
  | "done";

export type AnalysisProgress = {
  step: AnalysisStep;
  progress: number;
  message: string;
};

export type RawTrendItem = {
  title: string;
  source: string;
  score: number;
  timestamp: number;
};



export type AnalysisResult = {
  generatedAt: number;
  summary: string;
  items: RawTrendItem[];
};

export type RunAnalysisOptions = {
  onProgress?: (payload: AnalysisProgress) => void | Promise<void>;
};
