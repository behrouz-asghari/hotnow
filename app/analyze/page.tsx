"use client";

import { useEffect, useRef, useState } from "react";

type RawTrendItem = {
  title: string;
  source: string;
  score: number;
  timestamp: number;
};

type AnalysisResult = {
  generatedAt: number;
  summary: string;
  items: RawTrendItem[];
};

type ProgressPayload = {
  step: string;
  progress: number;
  message: string;
};

export default function AnalyzePage() {
  const eventSourceRef = useRef<EventSource | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  const startAnalysis = () => {
    setIsRunning(true);
    setProgress(0);
    setStep("");
    setMessage("");
    setResult(null);
    setError("");

    eventSourceRef.current?.close();

    const es = new EventSource("/api/analyze/stream");
    eventSourceRef.current = es;

    es.addEventListener("progress", (event) => {
      const payload = JSON.parse((event as MessageEvent).data) as ProgressPayload;
      setProgress(payload.progress);
      setStep(payload.step);
      setMessage(payload.message);
    });

    es.addEventListener("done", (event) => {
      const payload = JSON.parse((event as MessageEvent).data) as {
        status: "done";
        data: AnalysisResult;
      };

      setResult(payload.data);
      setProgress(100);
      setStep("done");
      setMessage("تحلیل با موفقیت کامل شد");
      setIsRunning(false);
      es.close();
    });

    es.addEventListener("error", (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent).data) as {
          status: "error";
          message: string;
        };
        setError(payload.message);
      } catch {
        setError("اتصال SSE قطع شد یا خطایی رخ داد");
      }

      setIsRunning(false);
      es.close();
    });

    es.onerror = () => {
      setIsRunning(false);
      setError("ارتباط با سرور قطع شد");
      es.close();
    };
  };

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold">تحلیل ترندها با SSE</h1>
        <p className="text-sm text-gray-600">
          این نسخه بدون polling و بدون job state کار می‌کند.
        </p>
      </div>

      <div className="mb-6 flex gap-3">
        <button
          onClick={startAnalysis}
          disabled={isRunning}
          className="rounded-lg bg-black px-5 py-2.5 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRunning ? "در حال تحلیل..." : "شروع تحلیل"}
        </button>
      </div>

      <section className="mb-6 rounded-xl border p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium">وضعیت پردازش</span>
          <span className="text-sm text-gray-600">{progress}%</span>
        </div>

        <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-green-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid gap-2 text-sm">
          <div>
            <strong>مرحله:</strong> {step || "-"}
          </div>
          <div>
            <strong>پیام:</strong> {message || "-"}
          </div>
        </div>
      </section>

      {error ? (
        <section className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
          <strong>خطا:</strong> {error}
        </section>
      ) : null}

      {result ? (
        <section className="rounded-xl border p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="mb-2 text-xl font-semibold">نتیجه نهایی</h2>
            <p className="text-sm text-gray-500">
              زمان تولید: {new Date(result.generatedAt).toLocaleString("fa-IR")}
            </p>
          </div>

          <div className="mb-5 rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 font-medium">خلاصه تحلیل</h3>
            <p className="leading-7">{result.summary}</p>
          </div>

          <div>
            <h3 className="mb-3 font-medium">آیتم‌های برتر</h3>

            {result.items.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-sm text-gray-600">
                داده‌ای برای نمایش وجود ندارد.
              </div>
            ) : (
              <ul className="space-y-3">
                {result.items.map((item, index) => (
                  <li
                    key={`${item.title}-${index}`}
                    className="rounded-lg border p-4"
                  >
                    <div className="mb-1 font-medium">{item.title}</div>
                    <div className="text-sm text-gray-600">
                      منبع: {item.source}
                    </div>
                    <div className="text-sm text-gray-600">
                      امتیاز: {item.score}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ) : null}
    </main>
  );
}
