import { kmeans } from "ml-kmeans";
import { CONFIG } from "../config";
import { ClusteredItem, NormalizedItem } from "../types";

const DIM = 256;

function vectorize(tokens: string[]): number[] {
  const vector = Array(DIM).fill(0);

  for (const token of tokens) {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = (hash * 31 + token.charCodeAt(i)) % DIM;
    }
    vector[hash] += 1;
  }

  // L2 normalization
  let norm = 0;
  for (let i = 0; i < DIM; i++) {
    norm += vector[i] * vector[i];
  }

  norm = Math.sqrt(norm) || 1;

  for (let i = 0; i < DIM; i++) {
    vector[i] /= norm;
  }

  return vector;
}

function euclideanSquared(a: number[], b: number[]): number {
  let sum = 0;

  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }

  return sum;
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === "number");
}

function getCentroid(value: unknown): number[] {
  if (isNumberArray(value)) {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "centroid" in value &&
    isNumberArray((value as { centroid: unknown }).centroid)
  ) {
    return (value as { centroid: number[] }).centroid;
  }

  throw new Error("Invalid centroid format returned by ml-kmeans");
}

function chooseK(itemsLength: number): number {
  return Math.min(
    CONFIG.clusterK,
    Math.max(3, Math.floor(Math.sqrt(itemsLength)))
  );
}

export function clusterItems(items: NormalizedItem[]): ClusteredItem[] {
  if (items.length === 0) return [];
  if (items.length === 1) {
    return [{ ...items[0], clusterId: 0 }];
  }

  const k = chooseK(items.length);
  const data = items.map((item) => vectorize(item.tokens));

  const km = kmeans(data, k, {
    initialization: "kmeans++",
    maxIterations: 100,
    tolerance: 1e-6,
    seed: 42,
  });

  const distances = data.map((vector, index) => {
    const clusterId = km.clusters[index];

    if (clusterId === undefined) {
      throw new Error(`Missing cluster assignment for item at index ${index}`);
    }

    const centroidRaw = km.centroids[clusterId];
    const centroid = getCentroid(centroidRaw);

    return euclideanSquared(vector, centroid);
  });

  const mean =
    distances.reduce((acc, value) => acc + value, 0) / distances.length;

  const variance =
    distances.reduce((acc, value) => acc + (value - mean) ** 2, 0) /
    distances.length;

  const std = Math.sqrt(variance);
  const outlierThreshold = mean + 2 * std;

  return items.map((item, index) => {
    const clusterId = km.clusters[index];

    if (clusterId === undefined) {
      throw new Error(`Missing cluster assignment for item at index ${index}`);
    }

    const isOutlier = distances[index] > outlierThreshold;

    return {
      ...item,
      clusterId: isOutlier ? -1 : clusterId,
    };
  });
}
