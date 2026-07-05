import { RawTrendItem, SafeResult, SourceName } from "../types";
import { SOURCES } from "../sources";
import { fetchWithTimeout } from "../sources/fetchWithTimeout";
import { memGet, memSet } from "../cache/memory";
import { CONFIG } from "../config";

export interface FetchResult {
  items: RawTrendItem[];
  results: Map<SourceName, SafeResult<RawTrendItem[]>>;
}

export async function fetchAllSources(): Promise<FetchResult> {
  // Check cache first — use minute-aligned key so all requests within same TTL window share cache
  const cacheBucket = Math.floor(Date.now() / (CONFIG.cacheTtlSec * 1000));
  const cacheKey = `sources:${cacheBucket}`;
  const cached = memGet<FetchResult>(cacheKey);
  if (cached) return cached;

  const entries = await Promise.all(
    SOURCES.map(async (source) => ({
      name: source.name,
      result: await fetchWithTimeout(source.fetcher, source.timeoutMs, source.name),
    }))
  );

  const results = new Map<SourceName, SafeResult<RawTrendItem[]>>(
    entries.map((e) => [e.name, e.result])
  );

  const items = entries.flatMap((e) => e.result.data ?? []);

  const result: FetchResult = { items, results };
  memSet(cacheKey, result, CONFIG.cacheTtlSec);

  return result;
}
