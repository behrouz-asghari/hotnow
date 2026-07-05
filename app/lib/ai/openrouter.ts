import { CONFIG } from "../config";

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMChoice {
  message: {
    role: string;
    content: string;
  };
  index: number;
  finish_reason: string;
}

export interface LLMResponse {
  id: string;
  choices: LLMChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function callOpenRouter(messages: LLMMessage[]): Promise<LLMResponse> {
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
    next: {
      revalidate: 86400,
      tags: ["analyze-page"],
    }
  });

  if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`);
  return res.json();
}
