import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST() {
  try {
    revalidateTag("analyze-page", "max");

    return NextResponse.json({
      ok: true,
      message: "Cache invalidated successfully",
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to invalidate cache",
      },
      { status: 500 }
    );
  }
}