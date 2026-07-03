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


export async function fetchTgStatTrends(): Promise<RawTrendItem[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch("https://ir.tgstat.com/ratings/posts/pt?sort=forwards", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      },
      next: { revalidate: 3600 },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return [];

    const html = await response.text();
    const $ = cheerio.load(html);
    const items: RawTrendItem[] = [];

    // هر پست در یک card قرار دارد
    $(".card.ribbon-box").each((_, el) => {
      const container = $(el);

      // استخراج عنوان پیام
      // در ساختار شما داخل تگ a با کلاس popup_ajax است
      const title = container.find(".popup_ajax").text().trim();

      // استخراج تعداد بازدید (داخل div که آیکون uil-eye دارد)
      // این المان در دو حالت دسکتاپ و موبایل متفاوت است، اما متن داخلش یکسان است
      const viewsText = container.find(".uil-eye").parent().text().trim();
      const views = parsePersianInt(viewsText);

      if (title && views > 0) {
        items.push({
          title: title.length > 100 ? title.substring(0, 97) + "..." : title,
          source: "tgstat",
          score: views, // استفاده از بازدید به عنوان امتیاز ترند
          timestamp: Date.now(),
        });
      }
    });

    return items;
  } catch (error) {
    console.error("TgStat Scrape Error:", error);
    return [];
  }
}