import { NormalizedItem, ClusterLabels, ForecastResult, SentimentResult } from "../types";
import { LLMMessage } from "./openrouter";

interface GeneralPromptPayload {
  items: NormalizedItem[];
  sentiment: SentimentResult;
  forecast: ForecastResult;
  labels: ClusterLabels;
}

interface SourcePromptPayload {
  items: NormalizedItem[];
  count: number;
}

const TRUNCATE_LIMIT = 12000;

function safeStringify(payload: unknown): string {
  return JSON.stringify(payload).slice(0, TRUNCATE_LIMIT);
}

export function buildGeneralAnalysisPrompt(
  payload: GeneralPromptPayload,
): LLMMessage[] {
  return [
{
role: "system",
content: [
"تو یک تحلیلگر داده فارسی هستی.",
"خروجی باید فقط یک JSON معتبر باشد.",
"هیچ markdown، code fence، توضیح قبل یا بعد از JSON تولید نکن.",
"هرگز کلیدهای خروجی را تغییر نده یا حذف نکن.",
].join(" "),
},
{
role: "user",
content: `بر اساس داده‌های ترند زیر، خروجی را دقیقاً با این schema برگردان:

{
  "text": "string",
  "sentiment": {
"fear": 0,
"excitement": 0,
"crisis": 0,
"sexualSignal": 0,
"politicalTension": 0,
"polarity": 0
  }
}

تعریف شاخص‌ها:
- fear: شدت نشانه‌های نگرانی، ناامنی یا اضطراب جمعی
- excitement: شدت هیجان، امید یا اشتیاق جمعی
- crisis: شدت نشانه‌های بحران، فوریت یا اختلال
- sexualSignal: شدت حضور سیگنال‌های جنسی یا رابطه‌ای در داده
- politicalTension: شدت تنش سیاسی در داده
- polarity: شدت تضاد، دو‌قطبی‌شدن یا اختلاف دیدگاه‌ها

قوانین:
- همه کلیدها اجباری‌اند.
- همه شاخص‌ها باید number و در بازه 0 تا 1 باشند.
- text فارسی، حداکثر دو پاراگراف، مبتنی بر شواهد و غیراغراق‌آمیز باشد.
- اگر داده ناکافی است، در text با احتیاط بیان کن؛ ولی همه کلیدهای JSON را حفظ کن.

داده:
${safeStringify(payload)}`,
},
  ];
}



export function buildWomenSocialPrompt(payload: SourcePromptPayload): LLMMessage[] {
  return [
    {
      role: "system",
      content:
        "تو یک تحلیلگر اجتماعی فارسی با تمرکز بر مسائل زنان، خانواده و فشارهای روانی-اجتماعی هستی. تحلیل باید دقیق، محترمانه و غیرقضاوت‌گر باشد. خروجی را به صورت markdown بنویس.",
    },
    {
      role: "user",
      content: `بر اساس داده‌های نی‌نی‌سایت، یک تحلیل اجتماعی تحلیلی ویژه زنان حداکثر در دو پاراگراف ارائه بده که دغدغه‌های پرتکرار، مسائل خانوادگی و رابطه‌ای، نشانه‌های اضطراب و فشار روانی، موضوعات حساس اجتماعی، الگوهای احساسی و جمع‌بندی روانشناختی-جامعه‌شناختی از وضعیت زنان ایرانی را پوشش دهد. از استنباط محتاطانه و لحن حرفه‌ای استفاده کن.\n\nداده:\n${safeStringify(payload)}`,
    },
  ];
}


export function buildDigikalaMarketPrompt(payload: SourcePromptPayload): LLMMessage[] {
  return [
    {
      role: "system",
      content:
        "تو یک تحلیلگر بازار و رفتار مصرف‌کننده فارسی هستی. تحلیل باید دقیق، واقع‌گرایانه و مبتنی بر نشانه‌های داده باشد. خروجی را به صورت markdown بنویس.",
    },
    {
      role: "user",
      content: `بر اساس داده محصولات پرفروش دیجی‌کالا، یک تحلیل اقتصادی و اجتماعی تحلیلی حداکثر در دو پاراگراف ارائه بده که مهم‌ترین دسته‌های کالایی، دلایل پرفروشی، نسبت خریدها با نیازهای روزمره و فشار اقتصادی، تمایز مصرف ضروری و احساسی، برداشت اجتماعی از سبد خرید و جمع‌بندی رفتار مصرف‌کننده ایرانی را پوشش دهد. اگر داده کافی نبود با احتیاط تحلیل کن.\n\nداده:\n${safeStringify(payload)}`,
    },
  ];
}
