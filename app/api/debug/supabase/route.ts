import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      return NextResponse.json({
        status: "error",
        message: "Env vars not set",
        url: url ? "set" : "missing",
        key: key ? "set" : "missing",
      });
    }

    const client = getSupabaseAdmin();

    // Test: count rows in raw_trend_items
    const { count, error } = await client
      .from("raw_trend_items")
      .select("*", { count: "exact", head: true });

    if (error) {
      return NextResponse.json({
        status: "error",
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
    }

    return NextResponse.json({
      status: "ok",
      url: url,
      rowCount: count,
    });
  } catch (e: any) {
    return NextResponse.json({
      status: "error",
      message: e.message,
    });
  }
}
