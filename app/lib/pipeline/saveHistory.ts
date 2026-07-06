import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { RawTrendItem } from "../types";

const BATCH_SIZE = 50;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function insertBatch(
  client: ReturnType<typeof getSupabaseAdmin>,
  rows: unknown[],
  retries = 0
): Promise<number> {
  try {
    const { data, error } = await client
      .from("raw_trend_items")
      .insert(rows)
      .select();

    if (error) throw error;
    return data?.length ?? rows.length;
  } catch (err: any) {
    if (retries < MAX_RETRIES) {
      console.log(`Batch insert failed (attempt ${retries + 1}/${MAX_RETRIES}), retrying...`);
      await sleep(RETRY_DELAY_MS * (retries + 1));
      return insertBatch(client, rows, retries + 1);
    }
    throw err;
  }
}

export async function saveRawTrendItems(items: RawTrendItem[]): Promise<{ inserted: number; skipped: number }> {
  try {
    const client = getSupabaseAdmin();
    const intervalHours = Number(process.env.RAW_TREND_INTERVAL_HOURS ?? "24");
    const cutoffDate = new Date(Date.now() - intervalHours * 60 * 60 * 1000).toISOString();

    console.log(`saveRawTrendItems: ${items.length} items to process`);

    const rowsToInsert: unknown[] = [];

    for (const item of items) {
      try {
        const { data: existing, error: checkError } = await client
          .from("raw_trend_items")
          .select("id")
          .eq("source", item.source)
          .eq("title", item.title)
          .gte("fetched_at", cutoffDate)
          .limit(1)
          .maybeSingle();

        if (checkError) {
          console.error("Check error:", item.title.slice(0, 30), checkError.message);
          continue;
        }

        if (existing) continue;

        rowsToInsert.push({
          title: item.title,
          normalized_title: item.title.toLowerCase().trim(),
          source: item.source,
          timestamp_text:
            item.timestamp != null ? String(item.timestamp) : null,
          traffic: item.traffic ?? null,
          views: item.views ?? null,
          score: item.score ?? null,
          details: item.details ?? [],
          url: item.url ?? null,
          image: item.image ?? null,
          fetched_at: new Date().toISOString(),
        });
      } catch {
        continue;
      }
    }

    console.log(`New items to insert: ${rowsToInsert.length}`);

    if (rowsToInsert.length === 0) {
      return { inserted: 0, skipped: items.length };
    }

    // Insert in batches
    let totalInserted = 0;
    for (let i = 0; i < rowsToInsert.length; i += BATCH_SIZE) {
      const batch = rowsToInsert.slice(i, i + BATCH_SIZE);
      const count = await insertBatch(client, batch);
      totalInserted += count;
      console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: inserted ${count} rows`);
    }

    console.log(`Total inserted: ${totalInserted}`);
    return {
      inserted: totalInserted,
      skipped: items.length - rowsToInsert.length,
    };
  } catch (err) {
    console.error("saveRawTrendItems failed:", err);
    return { inserted: 0, skipped: items.length };
  }
}
