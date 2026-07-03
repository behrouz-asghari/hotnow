//api/refresh/route.ts
import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

export async function POST() {
  try {
    revalidateTag("analyze-page", "max");
    revalidatePath("/");

    return NextResponse.json({
      ok: true,
      message: "Cache invalidated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to invalidate cache",
      },
      { status: 500 }
    );
  }
}
