"use client";

import { useEffect, useRef, useState } from "react";
import { AnalysisJobResponse } from "../lib/types";

export function useAnalysisJob() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<AnalysisJobResponse | null>(null);
  const [bootError, setBootError] = useState<string | null>(null);
  const [pollErrors, setPollErrors] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  async function start() {
    setBootError(null);
    setJob(null);
    setJobId(null);
    setPollErrors(0);

    try {
      const res = await fetch("/api/analyze/start", { method: "POST" });
      if (!res.ok) throw new Error("شروع تحلیل ناموفق بود");
      const data = await res.json();
      setJobId(data.jobId);
    } catch (e) {
      setBootError(String(e));
    }
  }

  useEffect(() => {
    start();
  }, []);

  useEffect(() => {
    if (!jobId) return;

    // Client-side timeout: 90s max wait
    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setBootError("تحلیل بیش از حد طول کشید. لطفاً دوباره تلاش کنید.");
    }, 90000);

    async function poll() {
      try {
        const res = await fetch(`/api/analyze/status?jobId=${jobId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("دریافت وضعیت تحلیل ناموفق بود");
        const data: AnalysisJobResponse = await res.json();
        setJob(data);
        setPollErrors(0);

        if (data.status === "done" || data.status === "error") {
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }
      } catch {
        setPollErrors((prev) => prev + 1);
      }
    }

    poll();
    intervalRef.current = setInterval(poll, 1500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [jobId]);

  return { job, error: bootError, pollErrors, start };
}
