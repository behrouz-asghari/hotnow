import * as cheerio from "cheerio";
import { RawTrendItem } from "../types";

// تابع کمکی برای تبدیل اعداد فارسی به انگلیسی و پارس کردن عدد
function parsePersianInt(text: string): number {
  const persianDigits = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  let clean = text;
  for (let i = 0; i < 10; i++) {
    clean = clean.replace(persianDigits[i], i.toString());
  }
  return parseInt(clean.replace(/[^\d]/g, "")) || 0;
}

export async function fetchNiniSiteHottest(): Promise<RawTrendItem[]> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch("https://www.ninisite.com/discussion/topics/hottest", {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)", // گاهی اوقات هویت بات گوگل بهتر جواب می‌دهد
      },
      next: { revalidate: 3600 },
      signal: controller.signal,
    });

    clearTimeout(id);
    if (!response.ok) return [];

    const html = await response.text();
    if (!html || html.length < 500) return []; // چک کردن برای جلوگیری از پارس کردن صفحات خالی بلاک شده

    const $ = cheerio.load(html);
    const items: RawTrendItem[] = [];

    $(".category--item").each((_, el) => {
      const title = $(el).find(".topic_subject").text().trim();
      const replyCount = parsePersianInt($(el).find(".topic_number").first().text());
      if (title) {
        items.push({
          title,
          source: "ninisite",
          score: replyCount || 50,
          timestamp: Date.now(),
        });
      }
    });
    return items;
  } catch (error) {
    return [];
  }
}


export async function fetchKarzarTop(): Promise<RawTrendItem[]> {
  try {
    const response = await fetch("https://www.karzar.net/campaigns/top", {
      next: { revalidate: 3600 },
    });
    const html = await response.text();
    const $ = cheerio.load(html);
    const items: RawTrendItem[] = [];

    $(".campaign-box__middle").each((_, el) => {
      const title = $(el).find(".campaign-box__title").text().trim();
      const signCount = parsePersianInt($(el).find(".campaign-box__sign-number").text());

      if (title) {
        items.push({
          title,
          source: "karzar",
          // هر ۱۰۰۰ امضا را معادل یک واحد امتیاز در نظر می‌گیریم (قابل تنظیم)
          score: Math.max(signCount / 100, 60),
          timestamp: Date.now(),
        });
      }
    });

    return items;
  } catch (error) {
    console.error("Karzar Scrape Error:", error);
    return [];
  }
}
