import { RawTrendItem } from "../analysis/types";
import { fetchWithTimeout } from "../utils/fetchWithTimeout";


type AnyRecord = Record<string, any>;

function safeNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeTitle(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function dedupeByTitle(items: RawTrendItem[]): RawTrendItem[] {
  const map = new Map<string, RawTrendItem>();

  for (const item of items) {
    const key = normalizeTitle(item.title);
    if (!key) continue;

    const existing = map.get(key);
    if (!existing || item.score > existing.score) {
      map.set(key, item);
    }
  }

  return [...map.values()];
}

function extractProducts(json: AnyRecord): AnyRecord[] {
  if (Array.isArray(json?.data?.products)) return json.data.products;
  if (Array.isArray(json?.data?.items)) return json.data.items;
  if (Array.isArray(json?.products)) return json.products;
  return [];
}

async function safeJson(res: Response): Promise<AnyRecord | null> {
  const contentType = res.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return (await res.json()) as AnyRecord;
  } catch {
    return null;
  }
}

export async function fetchDigikalaBestSelling(): Promise<RawTrendItem[]> {
  try {
    const res = await fetchWithTimeout(
      "https://api.digikala.com/v1/best-selling/",
      {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
          Accept: "application/json, text/plain, */*",
          "Accept-Language": "fa-IR,fa;q=0.9,en;q=0.8",
        },
        cache: "no-store",
      },
      5000
    );

    if (!res.ok) {
      console.warn("[digikala] HTTP error:", res.status);
      return [];
    }

    const json = await safeJson(res);

    if (!json) {
      console.warn("[digikala] non-JSON response");
      return [];
    }

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

      const score =
        ordersCount > 0
          ? ordersCount
          : ratingCount > 0
          ? ratingCount
          : Math.max(1, Math.round(ratingRate * 20));

      items.push({
        title,
        source: "digikala",
        score,
        timestamp: Date.now(),
      });
    }

    return dedupeByTitle(items);
  } catch (error) {
    console.error("[digikala] fetch failed:", error);
    return [];
  }
}
