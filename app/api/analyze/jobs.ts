// app/api/analyze/jobs.ts

import { AnalysisProgressPayload, AnalysisResult, AnalysisStep } from "./runAnalysis";


export type AnalysisJobStatus = "queued" | "running" | "done" | "error";

export type AnalysisJob = {
  id: string;
  status: AnalysisJobStatus;
  progress: number;
  step: AnalysisStep;
  message: string;
  data: AnalysisResult | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
  sources?: AnalysisProgressPayload["sources"];
};

declare global {
  // eslint-disable-next-line no-var
  var __analysisJobs: Map<string, AnalysisJob> | undefined;
}

export const jobs = globalThis.__analysisJobs ?? new Map<string, AnalysisJob>();

if (!globalThis.__analysisJobs) {
  globalThis.__analysisJobs = jobs;
}

export function createJob(id: string): AnalysisJob {
  const now = new Date().toISOString();

  const job: AnalysisJob = {
    id,
    status: "queued",
    progress: 0,
    step: "starting",
    message: "Job created",
    data: null,
    error: null,
    createdAt: now,
    updatedAt: now,
  };

  jobs.set(id, job);
  return job;
}

export function updateJob(
  id: string,
  patch: Partial<AnalysisJob>
): AnalysisJob | null {
  const current = jobs.get(id);
  if (!current) return null;

  const updated: AnalysisJob = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  jobs.set(id, updated);
  return updated;
}

export function getJob(id: string): AnalysisJob | null {
  return jobs.get(id) ?? null;
}
