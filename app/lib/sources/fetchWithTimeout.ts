import { SafeResult, SourceName } from "../types";

interface TimeoutError extends Error {
  code?: string;
}

export async function fetchWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  name: SourceName
): Promise<SafeResult<T>> {
  let timer: NodeJS.Timeout | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(`[${name}] timeout after ${timeoutMs}ms`) as TimeoutError;
      err.code = "TIMEOUT";
      reject(err);
    }, timeoutMs);
  });

  try {
    const data = await Promise.race([fn(), timeoutPromise]);
    if (timer) clearTimeout(timer);

    const isEmptyArray = Array.isArray(data) && data.length === 0;
    return {
      ok: true,
      data,
      status: isEmptyArray ? "empty" : "online",
    };
  } catch (e: unknown) {
    if (timer) clearTimeout(timer);
    const err = e instanceof Error ? e : new Error(String(e));
    const msg = err.message || "unknown_error";
    const code = "code" in err ? (err as TimeoutError).code : undefined;
    const isTimeout = code === "TIMEOUT" || /timeout/i.test(msg);
    console.error(`[${name}] failed:`, e);

    return {
      ok: false,
      data: undefined as T,
      error: msg,
      status: isTimeout ? "timeout" : "error",
    };
  }
}
