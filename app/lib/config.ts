export const CONFIG = {
  openRouterApiKey: process.env.OPENROUTER_API_KEY ?? "",
  openRouterModel: process.env.OPENROUTER_MODEL ?? "openrouter/free",
  openRouterBaseUrl: "https://openrouter.ai/api/v1",
  clusterK: 6,
  cacheTtlSec: 60 * 30, // 30 min
  aiCacheTtlSec: 60 * 60 * 6, // 6h
  wikiMaxItems: 200,
};
