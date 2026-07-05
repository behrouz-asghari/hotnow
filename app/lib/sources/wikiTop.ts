import { RawTrendItem } from "../types";
import { CONFIG } from "../config";

interface WikiArticle {
  article: string;
  rank: number;
  views: number;
}

export async function fetchWikiTopFa(): Promise<RawTrendItem[]> {
  const d = new Date();
  d.setDate(d.getDate() - 2);
  const ds = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;

  const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/fa.wikipedia.org/all-access/${ds}`;
  const res = await fetch(url, {
    next: {
      revalidate: 86400, tags: ["analyze-page"],
    }
  });
  if (!res.ok) return [];

  const json = await res.json();
  const articles = (json?.items?.[0]?.articles ?? []).slice(0, CONFIG.wikiMaxItems);

  return articles
    .filter((a: WikiArticle) => !a.article.includes(":") && a.article !== "صفحهٔ_اصلی")
    .map((a: WikiArticle) => ({
      source: "wiki" as const,
      title: decodeURIComponent(String(a.article).replaceAll("_", " ")),
      rank: a.rank,
      views: a.views,
      timestamp: new Date().toISOString(),
      url: `https://fa.wikipedia.org/wiki/${encodeURIComponent(a.article)}`,
    }));
}
