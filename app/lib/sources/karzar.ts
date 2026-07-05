import { RawTrendItem } from "../types";

export async function fetchKarzarTop(): Promise<RawTrendItem[]> {
  const res = await fetch("https://www.karzar.net/campaigns/top", {
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "text/html,application/xhtml+xml",
    },
    next: { revalidate: 86400, tags: ["analyze-page"] },
  });

  if (!res.ok) return [];
  const finalUrl = res.url || "";
  if (!finalUrl.includes("karzar.net")) return [];

  const html = await res.text();
  if (!html || html.length < 1000) return [];

  // Stub — cheerio parsing not yet implemented
  return [];
}
