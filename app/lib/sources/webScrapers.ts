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
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch("https://www.karzar.net/campaigns/top", {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(t);

    if (!res.ok) return [];
    const finalUrl = res.url || "";
    if (!finalUrl.includes("karzar.net")) return []; // redirect مشکوک

    const html = await res.text();
    if (!html || html.length < 1000) return [];

    // ... cheerio parse
    return [];
  } catch (e) {
    clearTimeout(t);
    console.error("Karzar Scrape Error:", e);
    return [];
  }
}

