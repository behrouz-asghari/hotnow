import * as cheerio from "cheerio";
import { RawTrendItem } from "../types";
import { parsePersianInt } from "../utils/text";

export async function fetchTgStatTrends(): Promise<RawTrendItem[]> {
  const response = await fetch("https://ir.tgstat.com/ratings/posts/pt?sort=forwards", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    },
    next: { revalidate: 86400, tags: ["analyze-page"] },
  });

  if (!response.ok) return [];

  const html = await response.text();
  const $ = cheerio.load(html);
  const items: RawTrendItem[] = [];

  $(".card.ribbon-box").each((_, el) => {
    const container = $(el);
    const title = container.find(".popup_ajax").text().trim();
    const viewsText = container.find(".uil-eye").parent().text().trim();
    const views = parsePersianInt(viewsText);

    if (title && views > 0) {
      items.push({
        title: title.length > 100 ? title.substring(0, 97) + "..." : title,
        source: "tgstat",
        score: views,
        timestamp: Date.now(),
      });
    }
  });

  return items;
}
