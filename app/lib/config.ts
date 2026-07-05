import { SourceName } from "./types";

export const CONFIG = {
  // LLM
  openRouterApiKey: process.env.OPENROUTER_API_KEY ?? "",
  openRouterModel: process.env.OPENROUTER_MODEL ?? "openrouter/free",
  openRouterBaseUrl: "https://openrouter.ai/api/v1",

  // Pipeline
  clusterK: 6,

  // Cache
  cacheTtlSec: 60 * 30,        // 30 min
  cacheMaxSize: 1000,

  // Sources
  wikiMaxItems: 200,
  // Reserved: per-source timeout overrides (not yet wired into fetchWithTimeout)
  sourceTimeouts: {
    google: 6000, wiki: 6000, ninisite: 7000, karzar: 7000,
    tgstat: 8000, digikala: 5000, filimo: 7000,
  } as Record<SourceName, number>,
};
