import crypto from "node:crypto";
import { NormalizedItem, RawTrendItem } from "../types";
import { normalizeFa, tokenizeFa } from "../utils/text";

export function normalizeAndFuse(items: RawTrendItem[]): NormalizedItem[] {
  return items
    .map((x) => {
      const cleanTitle = normalizeFa(x.title);
      const tokens = tokenizeFa(cleanTitle);

      const baseMetric =
        x.source === "google"
          ? x.traffic ?? x.score ?? 1
          : x.views ?? x.score ?? 1;

      const weight = Math.log10(baseMetric + 10);

      return {
        ...x,
        id: crypto.createHash("md5").update(`${x.source}:${cleanTitle}`).digest("hex"),
        cleanTitle,
        tokens,
        weight,
      };
    })
    .filter((x) => x.cleanTitle.length >= 3 && x.tokens.length > 0);
}
