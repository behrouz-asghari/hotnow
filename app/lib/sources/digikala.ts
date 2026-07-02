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
  try {
    const res = await fetch("https://api.digikala.com/v1/best-selling/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "fa-IR,fa;q=0.9,en;q=0.8",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Digikala HTTP ${res.status}`);
    }

    const json = await res.json();
    const products = extractProducts(json);

    const items: RawTrendItem[] = [];

    for (const product of products) {
      const title =
        product?.title_fa?.trim() ||
        product?.title_en?.trim() ||
        "";

      if (!title) continue;

      const ordersCount = safeNumber(product?.statistics?.orders_count, 0);
      const ratingCount = safeNumber(product?.rating?.count, 0);
      const ratingRate = safeNumber(product?.rating?.rate, 0);

      items.push({
        title,
        source: "digikala",
        score:
          ordersCount > 0
            ? ordersCount
            : ratingCount > 0
            ? ratingCount
            : Math.round(ratingRate * 20) || 1,
        timestamp: Date.now(),
      });
    }

    return dedupeByTitle(items);
  } catch (error) {
    console.error("Digikala Best Selling Error:", error);
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