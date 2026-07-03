import { RawTrendItem } from "../types";

type AnyRecord = Record<string, any>;

function safeNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function extractProducts(json: AnyRecord): AnyRecord[] {
  if (Array.isArray(json?.data?.products)) return json.data.products;
  if (Array.isArray(json?.data?.items)) return json.data.items;
  if (Array.isArray(json?.products)) return json.products;
  if (Array.isArray(json?.items)) return json.items;

  return [];
}

function normalizeTitle(product: AnyRecord): string {
  const titleFa =
    typeof product?.title_fa === "string" ? product.title_fa.trim() : "";

  const titleEn =
    typeof product?.title_en === "string" ? product.title_en.trim() : "";

  return titleFa || titleEn;
}

function extractProductScore(product: AnyRecord): number {
  return Math.max(
    safeNumber(product?.statistics?.orders_count, 0),
    safeNumber(product?.statistics?.views_count, 0),
    safeNumber(product?.rating?.count, 0),
    safeNumber(product?.default_variant?.statistics?.orders_count, 0),
    1
  );
}

function mapDigikalaProductToTrendItem(product: AnyRecord): RawTrendItem | null {
  const title = normalizeTitle(product);

  if (!title) return null;

  return {
    title,
    source: "digikala",
    score: extractProductScore(product),
    timestamp: Date.now(),
  };
}

function dedupeByTitle(items: RawTrendItem[]): RawTrendItem[] {
  const map = new Map<string, RawTrendItem>();

  for (const item of items) {
    const key = item.title.replace(/\s+/g, " ").trim().toLowerCase();

    if (!key) continue;

    const existing = map.get(key);

    if (!existing || (item.score ?? -Infinity) > (existing.score ?? -Infinity)) {
      map.set(key, item);
    }
  }

  return [...map.values()];
}

export async function fetchDigikalaBestSelling(): Promise<RawTrendItem[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch("https://api.digikala.com/v1/best-selling/", {
      headers: {
        Accept: "application/json, text/plain, */*",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Referer: "https://www.digikala.com/",
        Origin: "https://www.digikala.com",
        "Accept-Language": "fa-IR,fa;q=0.9,en;q=0.8",
      },
      next: {
        revalidate: 86400,
        tags: ["analyze-page"],
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      console.error(`Digikala API failed: ${res.status}`);
      return [];
    }

    const contentType = res.headers.get("content-type");

    if (!contentType?.includes("application/json")) {
      console.error(`Digikala API returned non-json content: ${contentType}`);
      return [];
    }

    const json = await res.json();
    const products = extractProducts(json);

    const items = products
      .map(mapDigikalaProductToTrendItem)
      .filter((item): item is RawTrendItem => item !== null);

    return dedupeByTitle(items);
  } catch (error) {
    console.error("fetchDigikalaBestSelling error:", error);
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}
