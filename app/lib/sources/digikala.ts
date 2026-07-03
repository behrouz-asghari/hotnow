import { RawTrendItem } from "../types";
type AnyRecord = Record<string, any>;

function safeNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function extractProducts(json: AnyRecord): AnyRecord[] {
  if (Array.isArray(json?.data?.products)) return json.data.products;
  if (Array.isArray(json?.data?.items)) return json.data.items;
  if (Array.isArray(json?.products)) return json.products;
  return [];
}

export async function fetchDigikalaBestSelling(): Promise<RawTrendItem[]> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 8000); // 8 ثانیه تایم‌اوت

  try {
    const res = await fetch("https://api.digikala.com/v1/best-selling/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
      },
      next: {
        revalidate: 86400, tags: ["analyze-page"],
      },
    });

    clearTimeout(id);

    if (!res.ok) return []; // اگر بلاک بود یا 403 داد، سریع برمی‌گردیم

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) return [];

    const json = await res.json();
    const products = extractProducts(json);

    const items: RawTrendItem[] = [];
    for (const product of products) {
      const title = product?.title_fa?.trim() || product?.title_en?.trim() || "";
      if (!title) continue;

      items.push({
        title,
        source: "digikala",
        score: safeNumber(product?.statistics?.orders_count, 1),
        timestamp: Date.now(),
      });
    }
    return dedupeByTitle(items);
  } catch (error) {
    return [];
  }
}


function dedupeByTitle(items: RawTrendItem[]): RawTrendItem[] {
  const map = new Map<string, RawTrendItem>();

  for (const item of items) {
    const key = item.title.replace(/\s+/g, " ").trim().toLowerCase();
    if (!map.has(key)) {
      map.set(key, item);
    }
  }

  return [...map.values()];
}