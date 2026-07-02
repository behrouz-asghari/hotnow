import { NextResponse } from "next/server";
import { runAnalysis } from "./runAnalysis";

export async function GET() {
  try {
    const result = await runAnalysis();

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      {
        error: "analysis_failed",
        message: `خطا در تحلیل داده‌ها: ${String(e)}`,
      },
      { status: 500 }
    );
  }
}
