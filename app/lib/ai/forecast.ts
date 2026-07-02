import { ClusteredItem, ForecastResult } from "../types";

export function forecastTomorrow(items: ClusteredItem[]): ForecastResult {
  const s = items.reduce((a, b) => a + b.weight, 0) / Math.max(1, items.length);
  const nextDayScore = Number((s * 1.08).toFixed(2));
  return {
    nextDayScore,
    confidence: 0.62,
    direction: nextDayScore > s ? "up" : "flat",
  };
}
