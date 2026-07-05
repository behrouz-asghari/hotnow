import { ClusteredItem, ForecastResult } from "../types";

export function forecastTomorrow(items: ClusteredItem[]): ForecastResult {
  if (items.length === 0) {
    return { nextDayScore: 0, confidence: 0, direction: "flat" };
  }

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const avgWeight = totalWeight / items.length;

  const highWeightItems = items.filter((item) => item.weight > avgWeight);
  const highWeightRatio = highWeightItems.length / items.length;

  // Confidence based on data consistency
  const weightVariance =
    items.reduce((sum, item) => sum + Math.pow(item.weight - avgWeight, 2), 0) /
    items.length;
  const weightStd = Math.sqrt(weightVariance);
  const consistencyScore = Math.max(0, 1 - weightStd / (avgWeight + 1));
  const confidence = Math.min(0.95, Math.max(0.1, consistencyScore * 0.8 + highWeightRatio * 0.2));

  // Direction based on weight distribution
  const nextDayScore = Number((avgWeight * 1.08).toFixed(2));
  const direction = nextDayScore > avgWeight * 1.02
    ? "up"
    : nextDayScore < avgWeight * 0.98
      ? "down"
      : "flat";

  return { nextDayScore, confidence: Number(confidence.toFixed(2)), direction };
}
