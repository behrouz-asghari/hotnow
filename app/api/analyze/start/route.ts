// app/api/analyze/start/route.ts
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createJob, updateJob } from "../jobs";
import { runAnalysis } from "../runAnalysis";

export async function POST() {
  const jobId = randomUUID();

  createJob(jobId);

  updateJob(jobId, {
    status: "running",
    progress: 0,
    step: "starting",
    message: "تحلیل در صف اجرا قرار گرفت",
  });

  void runAnalysis({
    onProgress(payload) {
      updateJob(jobId, {
        status: payload.step === "failed" ? "error" : "running",
        progress: payload.progress,
        step: payload.step,
        message: payload.message,
        sources: payload.sources,
      });
    },
  })
    .then((result) => {
      updateJob(jobId, {
        status: "done",
        progress: 100,
        step: "completed",
        message: "تحلیل تکمیل شد",
        data: result,
        error: null,
      });
    })
    .catch((error) => {
      updateJob(jobId, {
        status: "error",
        progress: 100,
        step: "failed",
        message: "تحلیل با خطا متوقف شد",
        error: String(error),
      });
    });

  return NextResponse.json({ jobId });
}
