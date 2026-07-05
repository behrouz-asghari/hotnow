import * as cheerio from "cheerio";
import { RawTrendItem } from "../types";
import { parsePersianInt } from "../utils/text";

export async function fetchNiniSiteHottest(): Promise<RawTrendItem[]> {
  const response = await fetch("https://www.ninisite.com/discussion/topics/hottest", {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    },
    next: { revalidate: 86400, tags: ["analyze-page"] },
  });

  if (!response.ok) return [];

  const html = await response.text();
  if (!html || html.length < 500) return [];

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
}
