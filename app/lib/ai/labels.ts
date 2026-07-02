import { ClusteredItem } from "../types";

export function generateClusterLabels(items: ClusteredItem[]): Record<number, string> {
  const labels: Record<number, string> = {};

  const groups: Record<number, string[]> = {};

  items.forEach((item) => {
    if (item.clusterId !== -1) {
      if (!groups[item.clusterId]) groups[item.clusterId] = [];
      groups[item.clusterId].push(item.title);
    }
  });

  Object.keys(groups).forEach((cid) => {
    const clusterId = parseInt(cid);
    const titles = groups[clusterId];

    const combined = titles.join(" ");
    const words = combined.split(/\s+/).filter(w => w.length > 3);

    const topWords = Array.from(new Set(words)).slice(0, 3).join(" / ");

    labels[clusterId] = topWords || `دسته ${clusterId + 1}`;
  });

  labels[-1] = "متفرقه";

  return labels;
}
