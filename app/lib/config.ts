export const CONFIG = {
  openRouterApiKey: process.env.OPENROUTER_API_KEY ?? "",
  openRouterModel: process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini",
  openRouterBaseUrl: "https://openrouter.ai/api/v1",
  clusterK: 6,
};
