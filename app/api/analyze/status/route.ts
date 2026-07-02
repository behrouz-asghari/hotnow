// app/api/analyze/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getJob } from "../jobs";

export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json(
      { error: "job_id_required", message: "jobId is required" },
      { status: 400 }
    );
  }

  const job = getJob(jobId);

  if (!job) {
    return NextResponse.json(
      { error: "job_not_found", message: "Job not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(job, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
