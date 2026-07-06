import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

interface TitleRecord {
  title: string;
  normalized_title: string;
  daysAppeared: number;
  firstSeen: string;
  lastSeen: string;
  bestScore: number | null;
  lastScore: number | null;
  dailyScores: { date: string; score: number | null }[];
}

interface SourceHistory {
  source: string;
  dates: string[];
  topTitles: TitleRecord[];
  totalItems: number;
}

export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source") ?? "google";
    const days = parseInt(searchParams.get("days") ?? "30", 10);
    const search = searchParams.get("search");

    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceISO = since.toISOString();

    let query = client
      .from("raw_trend_items")
      .select("title, normalized_title, source, fetched_at, score, traffic, views")
      .eq("source", source)
      .gte("fetched_at", sinceISO)
      .order("fetched_at", { ascending: false });

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("History query error:", error.message);
      return NextResponse.json(
        { error: "query_failed", message: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        source,
        dates: [],
        topTitles: [],
        totalItems: 0,
      });
    }

    // Normalize metric to single score
    function normalizeScore(row: any): number | null {
      if (row.score != null && row.score > 0) return row.score;
      if (row.traffic != null && row.traffic > 0) return row.traffic;
      if (row.views != null && row.views > 0) return row.views;
      return null;
    }

    // Collect unique dates
    const datesSet = new Set<string>();
    for (const row of data) {
      datesSet.add(row.fetched_at.slice(0, 10));
    }
    const dates = Array.from(datesSet).sort();

    // Group by normalized_title
    const titleMap: Record<string, {
      title: string;
      normalized_title: string;
      appearances: { date: string; score: number | null }[];
    }> = {};

    for (const row of data) {
      const date = row.fetched_at.slice(0, 10);
      const key = row.normalized_title;

      if (!titleMap[key]) {
        titleMap[key] = {
          title: row.title,
          normalized_title: row.normalized_title,
          appearances: [],
        };
      }

      titleMap[key].appearances.push({
        date,
        score: normalizeScore(row),
      });
    }

    // Build title records
    const topTitles: TitleRecord[] = Object.values(titleMap)
      .map((t) => {
        const sortedDates = t.appearances.map((a) => a.date).sort();
        const firstSeen = sortedDates[0];
        const lastSeen = sortedDates[sortedDates.length - 1];

        const scores = t.appearances.map((a) => a.score).filter((v): v is number => v != null);
        const lastAppearance = t.appearances[t.appearances.length - 1];

        return {
          title: t.title,
          normalized_title: t.normalized_title,
          daysAppeared: new Set(sortedDates).size,
          firstSeen,
          lastSeen,
          bestScore: scores.length > 0 ? Math.max(...scores) : null,
          lastScore: lastAppearance?.score ?? null,
          dailyScores: t.appearances,
        };
      })
      .sort((a, b) => b.daysAppeared - a.daysAppeared);

    return NextResponse.json({
      source,
      dates,
      topTitles,
      totalItems: data.length,
    });
  } catch (e) {
    console.error("History API error:", e);
    return NextResponse.json(
      { error: "internal_error", message: "خطای داخلی سرور" },
      { status: 500 }
    );
  }
}
