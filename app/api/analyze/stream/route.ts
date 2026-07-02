import { runAnalysis } from "@/app/lib/analysis/runAnalysis";

export const runtime = "nodejs";
export const maxDuration = 60;

function createSSEEvent(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(createSSEEvent(event, data)));
      };

      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`: heartbeat\n\n`));
      }, 15000);

      try {
        send("progress", {
          step: "init",
          progress: 0,
          message: "اتصال SSE برقرار شد",
        });

        const result = await runAnalysis({
          async onProgress(payload) {
            send("progress", payload);
          },
        });

        send("done", {
          status: "done",
          data: result,
        });
      } catch (error) {
        send("error", {
          status: "error",
          message:
            error instanceof Error ? error.message : "Unknown server error",
        });
      } finally {
        clearInterval(heartbeat);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
