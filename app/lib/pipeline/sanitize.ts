import { RawTrendItem, SourceName } from "../types";

export function sanitizeItems(
  items: RawTrendItem[],
  source: SourceName
): RawTrendItem[] {
  return items
    .filter(
      (x) =>
        x &&
        typeof x.title === "string" &&
        x.title.trim().length > 0
    )
    .map((x) => ({
      ...x,
      source: x.source ?? source,
      title: x.title.trim(),
      score: typeof x.score === "number" && Number.isFinite(x.score) ? x.score : 0,
      timestamp:
        typeof x.timestamp === "number" && Number.isFinite(x.timestamp)
          ? x.timestamp
          : Date.now(),
    }));
}
