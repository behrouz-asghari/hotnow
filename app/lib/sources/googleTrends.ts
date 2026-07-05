import { XMLParser } from "fast-xml-parser";
import { RawTrendItem } from "../types";

interface GoogleTrendItem {
  title?: string;
  "ht:approx_traffic"?: string;
  "ht:news_item_url"?: string;
  link?: string;
}

export async function fetchGoogleTrendsIR(): Promise<RawTrendItem[]> {
  const res = await fetch("https://trends.google.com/trending/rss?geo=IR", {
    next: { revalidate: 86400, tags: ["analyze-page"] },
  });
  const text = await res.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });
  const jsonObj = parser.parse(text);
  const items = jsonObj?.rss?.channel?.item ?? [];

  return items.map((it: GoogleTrendItem) => ({
    source: "google" as const,
    title: it.title ?? "",
    traffic: parseTraffic(it["ht:approx_traffic"]),
    url: it["ht:news_item_url"] || it.link,
    timestamp: new Date().toISOString(),
  }));
}

function parseTraffic(v: string | undefined): number {
  if (!v) return 0;
  const n = Number(String(v).replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : 0;
}
