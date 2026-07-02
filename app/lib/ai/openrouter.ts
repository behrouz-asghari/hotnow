import { CONFIG } from "../config";

export async function callOpenRouter(messages: any[]) {
  const res = await fetch(`${CONFIG.openRouterBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CONFIG.openRouterApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: CONFIG.openRouterModel,
      messages,
      temperature: 0.2,
    }),
  });

  if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`);
  return res.json();
}
