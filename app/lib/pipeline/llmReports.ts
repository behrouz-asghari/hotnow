import { NormalizedItem, ClusteredItem, ClusterLabels, SentimentResult, ForecastResult } from "../types";
import { callOpenRouter } from "../ai/openrouter";
import {
  buildGeneralAnalysisPrompt,
  buildWomenSocialPrompt,
  buildDigikalaMarketPrompt,
} from "../ai/prompts";

export interface LLMReports {
  generalReport: string;
  womenSocialReport: string;
  marketReport: string;
  reportWarnings: string[];
}

export async function generateReports(
  clustered: ClusteredItem[],
  sentiment: SentimentResult,
  forecast: ForecastResult,
  labels: ClusterLabels,
  ninisiteItems: NormalizedItem[],
  digikalaItems: NormalizedItem[]
): Promise<LLMReports> {
  const warnings: string[] = [];

  const generalMessages = buildGeneralAnalysisPrompt({
    items: clustered.slice(0, 40),
    sentiment,
    forecast,
    labels,
  });

  const [generalLLM, womenLLM, marketLLM] = await Promise.all([
    callOpenRouter(generalMessages).catch((e) => {
      console.error("[LLM][general] failed:", e);
      return null;
    }),
    ninisiteItems.length > 0
      ? callOpenRouter(
          buildWomenSocialPrompt({
            items: ninisiteItems.slice(0, 40),
            count: ninisiteItems.length,
          })
        ).catch((e) => {
          console.error("[LLM][women] failed:", e);
          return null;
        })
      : Promise.resolve(null),
    digikalaItems.length > 0
      ? callOpenRouter(
          buildDigikalaMarketPrompt({
            items: digikalaItems.slice(0, 40),
            count: digikalaItems.length,
          })
        ).catch((e) => {
          console.error("[LLM][market] failed:", e);
          return null;
        })
      : Promise.resolve(null),
  ]);

  const generalReport =
    generalLLM?.choices?.[0]?.message?.content?.trim() ||
    "تحلیل کلی با داده‌های موجود تولید نشد.";
  if (!generalLLM) warnings.push("گزارش تحلیل کلی به دلیل خطای سرویس AI با متن پیش‌فرض تولید شد.");

  const womenSocialReport =
    ninisiteItems.length === 0
      ? "داده‌ای از نی‌نی‌سایت دریافت نشد؛ تحلیل اجتماعی زنان میسر نیست."
      : womenLLM?.choices?.[0]?.message?.content?.trim() ||
        "تحلیل اجتماعی زنان در حال حاضر تولید نشد.";
  if (ninisiteItems.length > 0 && !womenLLM) warnings.push("گزارش تحلیل اجتماعی زنان به دلیل خطای سرویس AI تولید نشد.");

  const marketReport =
    digikalaItems.length === 0
      ? "داده‌ای از دیجی‌کالا دریافت نشد؛ تحلیل اقتصادی بازار میسر نیست."
      : marketLLM?.choices?.[0]?.message?.content?.trim() ||
        "تحلیل بازار در حال حاضر تولید نشد.";
  if (digikalaItems.length > 0 && !marketLLM) warnings.push("گزارش تحلیل بازار به دلیل خطای سرویس AI تولید نشد.");

  return { generalReport, womenSocialReport, marketReport, reportWarnings: warnings };
}
